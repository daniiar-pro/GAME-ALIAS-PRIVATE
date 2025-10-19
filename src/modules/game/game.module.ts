import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema, Room, RoomSchema } from 'src/infra/database/schemas';
import { GamesService } from './game.service';
import { GamesController } from './game.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  providers: [GamesService],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GameModule {}
