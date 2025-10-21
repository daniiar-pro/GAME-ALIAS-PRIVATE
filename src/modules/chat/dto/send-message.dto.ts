import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello team! 🎉' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
