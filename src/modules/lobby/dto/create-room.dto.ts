import { IsString, Length } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @Length(2, 60)
  name: string;
}
