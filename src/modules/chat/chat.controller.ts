import { Body, Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // 1. history()
  // 2. send('message')
}
