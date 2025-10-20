import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'username or email to log in',
    example: 'user123 or user@example.com',
  })
  @IsNotEmpty({ message: 'This field is required' })
  @IsString()
  readonly usernameOrEmail: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'Password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'This field is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  readonly password: string;
}
