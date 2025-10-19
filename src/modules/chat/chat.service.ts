import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
  Room,
  User,
} from 'src/infra/database/schemas';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatModel: Model<ChatMessageDocument>,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // 1. history()
  // 2. post()
}
