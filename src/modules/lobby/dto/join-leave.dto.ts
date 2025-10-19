import { IsOptional, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString() userId: string;
  @IsOptional() @IsString() teamId?: string;
}

export class LeaveRoomDto {
  @IsString() userId: string;
}
