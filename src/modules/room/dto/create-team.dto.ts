import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Red Rockets' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({
    description:
      'Optional client-generated team id (string). If omitted, server generates.',
    example: 'team-a',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id?: string;
}
