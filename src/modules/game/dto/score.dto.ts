import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreDto {
  @ApiProperty({
    description: 'Team ID (Room.team.id, not _id)',
    example: 'teamA',
  })
  teamId!: string;

  @ApiProperty({ description: 'Score delta (e.g., +1, -1)', example: 1 })
  @Type(() => Number)
  @IsInt()
  delta!: number;
}
