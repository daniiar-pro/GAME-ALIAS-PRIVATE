import { IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @IsString() roomId: string;
  @IsString() userId: string;
  @IsString() @Length(1, 1000) content: string;
}
