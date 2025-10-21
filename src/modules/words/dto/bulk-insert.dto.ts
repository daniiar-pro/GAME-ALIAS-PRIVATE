import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BulkInsertDto {
  @ApiProperty({ type: [String], example: ['apple', 'banana', 'cherry'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10_000)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(120, { each: true })
  items: string[];
}
