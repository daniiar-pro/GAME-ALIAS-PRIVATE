import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Name of the room' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  name: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
