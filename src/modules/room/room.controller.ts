import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RoomService } from './room.service';
import { Room } from '../../infra/database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
// import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('Room')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: Room,
  })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'List of all rooms', type: [Room] })
  findAll() {
    return this.roomService.getAllRooms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room details', type: Room })
  findOne(@Param('id') id: string) {
    return this.roomService.getRoomById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.roomService.deleteRoom(id);
  }

  // @Patch(':roomId/join/:userId')
  // @ApiOperation({ summary: 'Join user to room' })
  // @ApiResponse({ status: 200, description: 'User joined room', type: Room })
  // joinRoom(@Param('roomId') roomId: string, @Param('userId') userId: string) {
  //   return this.roomService.joinRoom(roomId, userId);
  // }

  // @Patch(':roomId/leave/:userId')
  // @ApiOperation({ summary: 'Leave room' })
  // @ApiResponse({ status: 200, description: 'User left room', type: Room })
  // leaveRoom(@Param('roomId') roomId: string, @Param('userId') userId: string) {
  //   return this.roomService.leaveRoom(roomId, userId);
  // }

  // @Post(':roomId/teams')
  // @ApiOperation({ summary: 'Create a new team in room' })
  // @ApiResponse({ status: 201, description: 'Team created', type: Room })
  // createTeam(
  //   @Param('roomId') roomId: string,
  //   @Body() createTeamDto: CreateTeamDto,
  // ) {
  //   return this.roomService.createTeam(
  //     roomId,
  //     createTeamDto.id,
  //     createTeamDto.name,
  //   );
  // }

  // @Delete(':roomId/teams/:teamId')
  // @ApiOperation({ summary: 'Delete a team from room' })
  // @ApiResponse({ status: 200, description: 'Team deleted', type: Room })
  // deleteTeam(@Param('roomId') roomId: string, @Param('teamId') teamId: string) {
  //   return this.roomService.deleteTeam(roomId, teamId);
  // }

  // @Patch(':roomId/teams/:teamId/assign/:userId')
  // @ApiOperation({ summary: 'Assign user to a team' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User assigned to team',
  //   type: Room,
  // })
  // assignUserToTeam(
  //   @Param('roomId') roomId: string,
  //   @Param('teamId') teamId: string,
  //   @Param('userId') userId: string,
  // ) {
  //   return this.roomService.assignUserToTeam(roomId, userId, teamId);
  // }

  // @Patch(':roomId/teams/:teamId/players/:userId')
  // @ApiOperation({ summary: 'Remove user from team' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User removed from team',
  //   type: Room,
  // })
  // removeUserFromTeam(
  //   @Param('roomId') roomId: string,
  //   @Param('teamId') teamId: string,
  //   @Param('userId') userId: string,
  // ) {
  //   return this.roomService.removeUserFromTeam(roomId, userId, teamId);
  // }

  // @Patch(':roomId/start')
  // @ApiOperation({ summary: 'Start game in room' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Game started successfully',
  //   type: Room,
  // })
  // startRoom(
  //   @Param('roomId') roomId: string,
  //   @Query('maxRounds') maxRounds?: number,
  // ) {
  //   return this.roomService.startRoom(
  //     roomId,
  //     maxRounds,
  //   );
  // }
}
