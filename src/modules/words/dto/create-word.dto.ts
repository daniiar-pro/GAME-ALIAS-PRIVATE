import { IsString, Length } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @Length(1, 120)
  text: string;
}
