import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({ description: 'User id (Mongo ObjectId string)' })
  @IsString()
  userId!: string;
}
