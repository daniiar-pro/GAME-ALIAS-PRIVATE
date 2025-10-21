import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema, Room, RoomSchema } from 'src/infra/database/schemas';
import { GamesService } from './game.service';
import { GamesController } from './game.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WordsModule } from '../words/words.module';
import { RoomModule } from '../room/room.module';
import { TurnManagerService } from './turn-manager.service';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      forwardRef(() => AuthModule),
      forwardRef(() => UsersModule),
      forwardRef(() => WordsModule),
      forwardRef(() => RoomModule),
    ]),
  ],
  providers: [GamesService, TurnManagerService, GameGateway],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GameModule {}
