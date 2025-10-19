import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(3, 50) username?: string;
}
