import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Room,
  RoomSchema,
  User,
  UserSchema,
} from '../../infra/database/schemas';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [LobbyService],
  controllers: [LobbyController],
  exports: [LobbyService],
})
export class LobbyModule {}
