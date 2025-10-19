import { Body, Controller } from '@nestjs/common';
import { GamesService } from './game.service';
// import { StartGameDto } from './dto/start-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  // 1. start()
  // 2. get() :gameId
}
