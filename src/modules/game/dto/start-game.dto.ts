import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class StartGameDto {
  @IsString() roomId: string;

  @IsArray()
  @ArrayMinSize(2)
  teams: { name: string; playerIds: string[] }[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRounds?: number;
}
