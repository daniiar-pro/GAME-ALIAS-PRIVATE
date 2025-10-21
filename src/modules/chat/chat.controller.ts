import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { HistoryQueryDto } from './dto/history-query.dto';

// If your JWT guard is global, you can remove @UseGuards below.
// Otherwise, uncomment and import your guard.
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

function userIdFromReq(req: Request): string {
  return (req as any)?.user?.sub ?? (req as any)?.user?.id;
}

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/messages')
  @ApiOkResponse({ description: 'Message persisted and echoed back' })
  async send(
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const userId = userIdFromReq(req);
    return this.chat.sendMessage(roomId, userId, dto.content);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('rooms/:roomId/messages')
  async history(@Param('roomId') roomId: string, @Query() q: HistoryQueryDto) {
    return this.chat.listHistory(roomId, q.limit, q.before);
  }
}
