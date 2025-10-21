import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TurnStartDto {
  @ApiPropertyOptional({
    description: 'Override turn duration (sec)',
    minimum: 15,
    maximum: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(300)
  turnSeconds?: number;
}
