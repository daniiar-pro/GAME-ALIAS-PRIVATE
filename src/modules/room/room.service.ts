import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room } from '../../infra/database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { Game } from 'src/infra/database/schemas/game.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(Game.name) private gameModel: Model<Game>,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = new this.roomModel(createRoomDto);
    return room.save();
  }

  async getAllRooms(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }

  async getRoomById(id: string): Promise<Room> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException(`Room with id ${id} not found`);
    return room;
  }

  async deleteRoom(id: string): Promise<void> {
    const result = await this.roomModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Room with id ${id} not found`);
  }

  // async joinRoom(roomId: string, userId: string): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);

  //   const alreadyJoined = room.members.some((m) => m.equals(userId));
  //   if (alreadyJoined) throw new ConflictException('User already joined');

  //   room.members.push(new Types.ObjectId(userId));
  //   return room.save();
  // }

  // async leaveRoom(roomId: string, userId: string): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);

  //   const userObjectId = new Types.ObjectId(userId);
  //   const initialCount = room.members.length;

  //   room.members = room.members.filter(
  //     (member) => !member.equals(userObjectId),
  //   );

  //   if (room.members.length === initialCount) {
  //     throw new NotFoundException('User not found in this room');
  //   }

  //   return room.save();
  // }

  // async createTeam(
  //   roomId: string,
  //   teamId: string,
  //   name: string,
  // ): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);
  //   if (room.phase !== 'waiting')
  //     throw new BadRequestException('Cannot create team after game started');

  //   if (room.teams.some((t) => t.id === teamId))
  //     throw new BadRequestException('Team ID already exists');

  //   room.teams.push({ id: teamId, name, score: 0, players: [] });
  //   return room.save();
  // }

  // async deleteTeam(roomId: string, teamId: string): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);
  //   if (room.phase !== 'waiting')
  //     throw new BadRequestException('Cannot delete team after game started');

  //   const initialCount = room.teams.length;
  //   room.teams = room.teams.filter((t) => t.id !== teamId);

  //   if (room.teams.length === initialCount)
  //     throw new NotFoundException('Team not found');

  //   return room.save();
  // }

  // async assignUserToTeam(
  //   roomId: string,
  //   teamId: string,
  //   userId: string,
  // ): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);
  //   if (room.phase !== 'waiting')
  //     throw new BadRequestException('Cannot assign teams after game started');

  //   if (!room.members.some((m) => m.equals(userId)))
  //     throw new BadRequestException('User not in room');

  //   for (const t of room.teams) {
  //     t.players = t.players.filter((p) => !p.equals(userId));
  //   }

  //   const team = room.teams.find((t) => t.id === teamId);
  //   if (!team) throw new NotFoundException('Team not found');

  //   team.players.push(new Types.ObjectId(userId));
  //   return room.save();
  // }

  // async removeUserFromTeam(
  //   roomId: string,
  //   teamId: string,
  //   userId: string,
  // ): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);
  //   if (room.phase !== 'waiting')
  //     throw new BadRequestException('Cannot modify teams after game started');

  //   const team = room.teams.find((t) => t.id === teamId);
  //   if (!team) throw new NotFoundException('Team not found');

  //   const beforeCount = team.players.length;
  //   team.players = team.players.filter((p) => !p.equals(userId));

  //   if (team.players.length === beforeCount)
  //     throw new BadRequestException('User not in this team');

  //   return room.save();
  // }

  // async startRoom(roomId: string, maxRounds = 5): Promise<Room> {
  //   const room = await this.roomModel.findById(roomId).exec();
  //   if (!room) throw new NotFoundException(`Room with id ${roomId} not found`);
  //   if (room.phase !== 'waiting')
  //     throw new BadRequestException('Room already started');
  //   if (room.members.length < 2)
  //     throw new BadRequestException('Not enough players');

  //   const unassigned = room.members.filter(
  //     (m) => !room.teams.some((t) => t.players.some((p) => p.equals(m))),
  //   );
  //   if (unassigned.length > 0)
  //     throw new BadRequestException('All players must be assigned to teams');

  //   const teamsForGame = room.teams.map((t) => ({
  //     id: t.id,
  //     name: t.name,
  //     score: 0,
  //     players: t.players,
  //   }));

  //   const game = await this.gameModel.create({
  //     roomId: room._id,
  //     teams: teamsForGame,
  //     currentRound: 1,
  //     maxRounds,
  //     isFinished: false,
  //   });

  //   room.activeGameId = game._id;
  //   room.phase = 'inGame';
  //   await room.save();

  //   return room;
  // }
}
