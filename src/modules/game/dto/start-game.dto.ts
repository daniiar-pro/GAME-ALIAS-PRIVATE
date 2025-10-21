import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StartGameDto {
  @ApiPropertyOptional({
    description: 'How many rounds',
    default: 5,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  maxRounds?: number = 5;

  @ApiPropertyOptional({
    description: 'Turn time in seconds',
    default: 60,
    minimum: 15,
    maximum: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(300)
  turnSeconds?: number = 60;
}
