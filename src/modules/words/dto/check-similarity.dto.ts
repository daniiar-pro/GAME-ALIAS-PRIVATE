import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CheckSimilarityDto {
  @ApiProperty({ example: 'elephant' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  word: string;

  @ApiProperty({ example: 'elefant' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  guess: string;
}
