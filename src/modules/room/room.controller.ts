import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { StartRoomDto } from './dto/start-room.dto';

// If guards are global (APP_GUARD), you can remove @UseGuards here.
// Otherwise uncomment and use:
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../../shared/roles/roles.decorator';
// import { Role } from '../../shared/roles/role.enum';

function userIdFromReq(req: Request): string {
  // adapt to your JWT payload shape; commonly req.user.sub or req.user.id
  return (req as any)?.user?.sub ?? (req as any)?.user?.id;
}

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private readonly rooms: RoomService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateRoomDto, @Req() req: Request) {
    const userId = userIdFromReq(req);
    return this.rooms.createRoom(dto, userId);
  }

  // public list; protect if you want
  @Get()
  async search(@Query() q: SearchRoomsDto) {
    return this.rooms.searchRooms(q);
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.rooms.getRoomById(id);
  }

  // @UseGuards(JwtAuthGuard /*, RolesGuard*/ )
  // @Roles(Role.Admin)
  @Delete(':id')
  @ApiOkResponse({ description: 'Room deleted' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = userIdFromReq(req);
    // pass isAdmin if your req.user carries roles; here we just pass false
    await this.rooms.deleteRoom(id, userId, /* isAdmin */ false);
    return { ok: true };
  }

  // membership
  // @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: Request) {
    const userId = userIdFromReq(req);
    return this.rooms.joinRoom(id, userId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  async leave(@Param('id') id: string, @Req() req: Request) {
    const userId = userIdFromReq(req);
    return this.rooms.leaveRoom(id, userId);
  }

  // teams
  // @UseGuards(JwtAuthGuard)
  @Post(':id/teams')
  async createTeam(@Param('id') id: string, @Body() dto: CreateTeamDto) {
    return this.rooms.createTeam(id, dto.name, dto.id);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id/teams/:teamId')
  async deleteTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
    return this.rooms.deleteTeam(id, teamId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post(':id/teams/:teamId/assign')
  async assign(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Body() body: AssignUserDto,
  ) {
    return this.rooms.assignUser(id, teamId, body.userId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post(':id/teams/:teamId/remove')
  async removeFromTeam(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Body() body: AssignUserDto,
  ) {
    return this.rooms.removeUserFromTeam(id, teamId, body.userId);
  }

  // start game
  // @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async start(@Param('id') id: string, @Body() dto: StartRoomDto) {
    return this.rooms.startRoom(id, dto.maxRounds ?? 5);
  }
}
