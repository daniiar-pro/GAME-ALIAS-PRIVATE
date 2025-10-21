import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room, RoomSchema } from '../../infra/database/schemas/room.schema';
import { Game, GameSchema } from 'src/infra/database/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Game.name, schema: GameSchema },
    ]),
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
