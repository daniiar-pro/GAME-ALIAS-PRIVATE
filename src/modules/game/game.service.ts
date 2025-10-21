import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Game } from '../../infra/database/schemas/game.schema';
import { RoomService } from '../room/room.service';
import { UsersService } from '../users/users.service';
import { WordService } from '../words/word.service';
import { TurnManagerService } from './turn-manager.service';

type TeamDTO = {
  id: string;
  name: string;
  players: Types.ObjectId[];
  score: number;
};

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<Game>,
    private readonly rooms: RoomService,
    private readonly users: UsersService,
    private readonly words: WordService,
    private readonly turns: TurnManagerService,
  ) {}

  private oid(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    return new Types.ObjectId(id);
  }

  /** Take teams from room → create a fresh Game doc; switch room to inGame */
  async startGame(
    roomId: string,
    requestedByUserId: string,
    maxRounds = 5,
    turnSeconds = 60,
  ) {
    const room = await this.rooms.getRoomById(roomId);

    // must be a member to start
    const isMember = room.members.some((m) => String(m) === requestedByUserId);
    if (!isMember)
      throw new ForbiddenException('Only room members can start a game');

    if (room.phase !== 'waiting')
      throw new BadRequestException('Room already started');

    if (!room.teams || room.teams.length < 2) {
      throw new BadRequestException('Need at least two teams to start');
    }

    // ensure each team has at least one player
    for (const t of room.teams) {
      if (!t.players || t.players.length === 0) {
        throw new BadRequestException(`Team "${t.name}" has no players`);
      }
    }

    // clone teams -> game.teams
    const teams: TeamDTO[] = room.teams.map((t) => ({
      id: t.id,
      name: t.name,
      score: 0,
      players: t.players as any,
    }));

    const game = await this.gameModel.create({
      roomId: this.oid(roomId),
      teams,
      currentRound: 1,
      maxRounds,
      isFinished: false,
    });

    await this.rooms.markRoomInGame(roomId, game._id); // implement in RoomService

    // initialize turn state (team 0 starts)
    this.turns.start(roomId, 0, turnSeconds, async () => {
      // onTimeout → move to next team (broadcast via gateway)
      // gateway will call back into nextTurn/public state fetch
    });

    return await this.getPublicStateByRoom(roomId);
  }

  /** Read game by room */
  async getByRoom(roomId: string) {
    const room = await this.rooms.getRoomById(roomId);
    if (!room.activeGameId)
      throw new NotFoundException('No active game in room');
    const game = await this.gameModel.findById(room.activeGameId).lean().exec();
    if (!game) throw new NotFoundException('Active game lost');
    return game;
  }

  /** Projected state returned to API/clients */
  async getPublicStateByRoom(roomId: string) {
    const game = await this.getByRoom(roomId);
    const t = this.turns.get(roomId);

    return {
      roomId,
      gameId: String(game._id),
      currentRound: game.currentRound,
      maxRounds: game.maxRounds,
      isFinished: game.isFinished,
      teams: game.teams.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        players: t.players.map(String),
      })),
      turn: t
        ? {
            teamIndex: t.teamIndex,
            teamId: game.teams[t.teamIndex]?.id,
            secondsLeft: Math.max(
              0,
              Math.floor((t.expiresAt - Date.now()) / 1000),
            ),
          }
        : null,
    };
  }

  /** Start/Restart the current turn (e.g., after next team) */
  async startTurn(roomId: string, turnSeconds?: number) {
    const game = await this.getByRoom(roomId);
    const totalTeams = game.teams.length;
    const prev = this.turns.get(roomId);
    const teamIndex = prev ? prev.teamIndex : 0;

    const duration = turnSeconds ?? prev?.turnSeconds ?? 60;
    this.turns.start(roomId, teamIndex, duration, async () => {
      // turn timeout → auto next team
      await this.nextTeam(roomId);
    });

    return this.getPublicStateByRoom(roomId);
  }

  /** Stop turn (keeps team index) */
  async stopTurn(roomId: string) {
    this.turns.stop(roomId);
    return this.getPublicStateByRoom(roomId);
  }

  /** Advance to next team and auto-start their turn (same duration) */
  async nextTeam(roomId: string) {
    const game = await this.getByRoom(roomId);
    const totalTeams = game.teams.length;

    const prev = this.turns.get(roomId);
    const duration = prev?.turnSeconds ?? 60;

    if (!prev) {
      this.turns.start(roomId, 0, duration, async () => {
        await this.nextTeam(roomId);
      });
    } else {
      const idx = this.turns.nextTeam(roomId, totalTeams) ?? 0;
      this.turns.start(roomId, idx, duration, async () => {
        await this.nextTeam(roomId);
      });
    }

    return this.getPublicStateByRoom(roomId);
  }

  /** Increment/decrement score for a team */
  async updateScore(roomId: string, teamId: string, delta: number) {
    const room = await this.rooms.getRoomById(roomId);
    if (!room.activeGameId) throw new NotFoundException('No active game');

    const updated = await this.gameModel.findOneAndUpdate(
      { _id: room.activeGameId, 'teams.id': teamId },
      { $inc: { 'teams.$.score': delta } },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Team not found in game');

    return this.getPublicStateByRoom(roomId);
  }

  /** End current round → if last round then finish game */
  async endRound(roomId: string) {
    const game = await this.getByRoom(roomId);

    if (game.currentRound >= game.maxRounds) {
      return this.finishGame(roomId);
    }

    await this.gameModel
      .updateOne({ _id: game._id }, { $inc: { currentRound: 1 } })
      .exec();

    // optional: reset team index to 0
    const t = this.turns.get(roomId);
    const duration = t?.turnSeconds ?? 60;
    this.turns.start(roomId, 0, duration, async () => {
      await this.nextTeam(roomId);
    });

    return this.getPublicStateByRoom(roomId);
  }

  /** Finish game */
  async finishGame(roomId: string) {
    const game = await this.getByRoom(roomId);

    await this.gameModel
      .updateOne({ _id: game._id }, { $set: { isFinished: true } })
      .exec();
    await this.rooms.markRoomFinished(roomId); // implement in RoomService
    this.turns.clear(roomId);

    // optional: bump user stats here via UsersService based on winner team
    return this.getPublicStateByRoom(roomId);
  }
}
