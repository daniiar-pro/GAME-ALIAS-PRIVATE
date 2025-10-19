import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail() email: string;

  @IsString()
  @Length(3, 50)
  username: string;

  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 letter and 1 number',
  })
  password: string;
}
