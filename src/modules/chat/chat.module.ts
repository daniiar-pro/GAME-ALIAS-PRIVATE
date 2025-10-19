import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatMessage,
  ChatMessageSchema,
  Room,
  RoomSchema,
  User,
  UserSchema,
} from 'src/infra/database/schemas';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
