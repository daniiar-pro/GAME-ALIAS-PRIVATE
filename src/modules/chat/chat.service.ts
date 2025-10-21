import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChatMessage } from '../../infra/database/schemas/chat-message.schema';
import { RoomService } from '../room/room.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatModel: Model<ChatMessage>,
    private readonly rooms: RoomService,
  ) {}

  private oid(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    return new Types.ObjectId(id);
  }

  /** Ensures room exists and user is a room member */
  private async ensureMembership(roomId: string, userId: string) {
    const room = await this.rooms.getRoomById(roomId);
    const isMember = room.members.some((m) => m.equals(this.oid(userId)));
    if (!isMember) throw new ForbiddenException('Not a room member');
    return room;
  }

  async sendMessage(roomId: string, userId: string, content: string) {
    const trimmed = (content ?? '').trim();
    if (!trimmed) throw new BadRequestException('Empty message');
    if (trimmed.length > 1000) throw new BadRequestException('Too long');

    await this.ensureMembership(roomId, userId);

    const doc = await this.chatModel.create({
      roomId: this.oid(roomId),
      userId: this.oid(userId),
      content: trimmed,
    });

    // shape what you expose to clients
    return {
      id: String((doc as any)._id),
      roomId,
      userId,
      content: doc.content,
      createdAt: (doc as any).createdAt as Date,
    };
  }

  async listHistory(roomId: string, limit = 50, beforeIso?: string) {
    // room must exist (but history can be read by members only)
    const room = await this.rooms.getRoomById(roomId);
    if (!room) throw new NotFoundException('Room not found');

    const query: any = { roomId: this.oid(roomId) };
    if (beforeIso) {
      const before = new Date(beforeIso);
      if (isNaN(before.getTime()))
        throw new BadRequestException('Invalid "before" cursor');
      query.createdAt = { $lt: before };
    }

    const items = await this.chatModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    // newest→oldest from DB; most clients want oldest→newest for rendering
    items.reverse();

    return items.map((m) => ({
      id: String(m._id),
      roomId: String(m.roomId),
      userId: String(m.userId),
      content: m.content,
      createdAt: m.createdAt!,
    }));
  }
}
