import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsISO8601,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Pagination size',
    default: 50,
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Return messages created *before* this ISO date (cursor)',
    example: '2025-01-10T18:10:00.000Z',
  })
  @IsOptional()
  @IsString()
  @IsISO8601()
  before?: string;
}
