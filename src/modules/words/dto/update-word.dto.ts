import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateWordDto {
  @ApiPropertyOptional({ example: 'giraffe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  text?: string;
}
