import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { nanoid } from 'nanoid';
import { Types } from 'mongoose';

import {
  Room,
  RoomDocument,
  RoomPhase,
} from '../../infra/database/schemas/room.schema';
import { Game, GameDocument } from '../../infra/database/schemas/game.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
  ) {}

  // helpers
  private oid(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    return new Types.ObjectId(id);
  }
  private assertWaiting(phase: RoomPhase) {
    if (phase !== 'waiting')
      throw new BadRequestException('Room is not in waiting phase');
  }

  // ...
  async markRoomInGame(roomId: string, gameId: Types.ObjectId) {
    const room = await this.roomModel.findByIdAndUpdate(
      roomId,
      { $set: { activeGameId: gameId, phase: 'inGame' } },
      { new: true },
    );
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async markRoomFinished(roomId: string) {
    const room = await this.roomModel.findByIdAndUpdate(
      roomId,
      { $set: { activeGameId: null, phase: 'finished' } },
      { new: true },
    );
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  // CRUD
  async createRoom(
    dto: CreateRoomDto,
    creatorId: string,
  ): Promise<RoomDocument> {
    const room = await this.roomModel.create({
      name: dto.name.trim(),
      createdBy: this.oid(creatorId),
      members: [this.oid(creatorId)],
      phase: 'waiting',
      activeGameId: null,
      teams: [],
    });
    return room;
  }

  async searchRooms(q: SearchRoomsDto) {
    const { limit = 20, offset = 0, q: query } = q;
    const filter: FilterQuery<RoomDocument> = {};
    if (query?.trim()) {
      filter.name = { $regex: query.trim(), $options: 'i' };
    }
    const [items, total] = await Promise.all([
      this.roomModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      this.roomModel.countDocuments(filter).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async getRoomById(id: string): Promise<RoomDocument> {
    const room = await this.roomModel.findById(this.oid(id)).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async deleteRoom(
    id: string,
    requesterId: string,
    isAdmin = false,
  ): Promise<void> {
    const room = await this.getRoomById(id);
    if (!isAdmin && !room.createdBy.equals(this.oid(requesterId))) {
      throw new ForbiddenException('Only creator or admin can delete the room');
    }
    await this.roomModel.deleteOne({ _id: room._id }).exec();
  }

  // membership
  async joinRoom(roomId: string, userId: string): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    // addToSet avoids duplicates
    const updated = await this.roomModel
      .findByIdAndUpdate(
        room._id,
        { $addToSet: { members: this.oid(userId) } },
        { new: true },
      )
      .exec();

    if (!updated) throw new NotFoundException('Room not found');
    return updated;
  }

  async leaveRoom(roomId: string, userId: string): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    // Remove from members and any team players
    const updated = await this.roomModel
      .findByIdAndUpdate(
        room._id,
        {
          $pull: {
            members: this.oid(userId),
            'teams.$[].players': this.oid(userId),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) throw new NotFoundException('Room not found');
    return updated;
  }

  // teams
  async createTeam(
    roomId: string,
    name: string,
    id?: string,
  ): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    const teamId = id?.trim() || nanoid(8);
    if (room.teams.some((t) => t.id === teamId)) {
      throw new ConflictException('Team id already exists');
    }

    room.teams.push({
      id: teamId,
      name: name.trim(),
      score: 0,
      players: [] as Types.ObjectId[],
    });
    await room.save();
    return room;
  }

  async deleteTeam(roomId: string, teamId: string): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    const before = room.teams.length;
    room.teams = room.teams.filter((t) => t.id !== teamId);
    if (room.teams.length === before)
      throw new NotFoundException('Team not found');

    await room.save();
    return room;
  }

  async assignUser(
    roomId: string,
    teamId: string,
    userId: string,
  ): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    const userOid = this.oid(userId);

    if (!room.members.some((m) => m.equals(userOid))) {
      throw new BadRequestException('User is not a room member');
    }

    // Remove user from any team, then push into target team
    for (const t of room.teams) {
      t.players = t.players.filter((p) => !p.equals(userOid));
    }

    const team = room.teams.find((t) => t.id === teamId);
    if (!team) throw new NotFoundException('Team not found');

    team.players.push(userOid);
    await room.save();
    return room;
  }

  async removeUserFromTeam(
    roomId: string,
    teamId: string,
    userId: string,
  ): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    const userOid = this.oid(userId);
    const team = room.teams.find((t) => t.id === teamId);
    if (!team) throw new NotFoundException('Team not found');

    const before = team.players.length;
    team.players = team.players.filter((p) => !p.equals(userOid));
    if (team.players.length === before) {
      throw new BadRequestException('User not in this team');
    }

    await room.save();
    return room;
  }

  // start game
  async startRoom(roomId: string, maxRounds = 5): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    this.assertWaiting(room.phase);

    if (room.members.length < 2) {
      throw new BadRequestException('Not enough players to start');
    }

    // ensure every member is assigned to some team
    const assigned = new Set<string>();
    for (const t of room.teams) {
      for (const p of t.players) assigned.add(String(p));
    }
    const unassigned = room.members.filter((m) => !assigned.has(String(m)));
    if (unassigned.length > 0) {
      throw new BadRequestException('All players must be assigned to teams');
    }

    // Project teams for the Game document (fresh scores)
    const gameTeams = room.teams.map((t) => ({
      id: t.id,
      name: t.name,
      score: 0,
      players: t.players,
    }));

    const game = await this.gameModel.create({
      roomId: room._id,
      teams: gameTeams,
      currentRound: 1,
      maxRounds,
      isFinished: false,
    });

    room.activeGameId = game._id;
    room.phase = 'inGame';
    await room.save();

    return room;
  }
}
