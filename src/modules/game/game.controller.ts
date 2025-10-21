import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GameService } from './game.service';
import { StartGameDto } from './dto/start-game.dto';
import { TurnStartDto } from './dto/turn-start.dto';
import { ScoreDto } from './dto/score.dto';

function userIdFromReq(req: Request): string {
  return (req as any)?.user?.sub ?? (req as any)?.user?.id;
}

@ApiTags('game')
@ApiBearerAuth()
@Controller('game/rooms/:roomId')
export class GameController {
  constructor(private readonly game: GameService) {}

  @Post('start')
  async start(
    @Param('roomId') roomId: string,
    @Body() dto: StartGameDto,
    @Req() req: Request,
  ) {
    const userId = userIdFromReq(req);
    return this.game.startGame(roomId, userId, dto.maxRounds, dto.turnSeconds);
  }

  @Get('state')
  async state(@Param('roomId') roomId: string) {
    return this.game.getPublicStateByRoom(roomId);
  }

  @Post('turn/start')
  async turnStart(@Param('roomId') roomId: string, @Body() dto: TurnStartDto) {
    return this.game.startTurn(roomId, dto.turnSeconds);
  }

  @Post('turn/stop')
  async turnStop(@Param('roomId') roomId: string) {
    return this.game.stopTurn(roomId);
  }

  @Post('turn/next')
  async nextTeam(@Param('roomId') roomId: string) {
    return this.game.nextTeam(roomId);
  }

  @Post('score')
  async score(@Param('roomId') roomId: string, @Body() dto: ScoreDto) {
    return this.game.updateScore(roomId, dto.teamId, dto.delta);
  }

  @Post('round/end')
  async endRound(@Param('roomId') roomId: string) {
    return this.game.endRound(roomId);
  }

  @Post('finish')
  async finish(@Param('roomId') roomId: string) {
    return this.game.finishGame(roomId);
  }
}
