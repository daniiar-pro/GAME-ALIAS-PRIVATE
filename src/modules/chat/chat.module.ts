import { forwardRef, Module } from '@nestjs/common';
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
import { AuthModule } from '../auth/auth.module';
import { RoomModule } from '../room/room.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      forwardRef(() => AuthModule),
      forwardRef(() => RoomModule),
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
