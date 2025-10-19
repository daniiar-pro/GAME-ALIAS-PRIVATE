import { Controller } from '@nestjs/common';
import { LobbyService } from './lobby.service';
// import { CreateRoomDto } from './dto/create-room.dto';
// import { JoinRoomDto, LeaveRoomDto } from './dto/join-leave.dto';

@Controller('rooms')
export class LobbyController {
  constructor(private readonly rooms: LobbyService) {}

  // 1. list()
  // 2. create()
  // 3. join()
  // 4. leave()
}
