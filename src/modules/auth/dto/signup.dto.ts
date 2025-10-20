import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/shared/roles/role.enum';

export class SignUpDto {
  @ApiProperty({
    description: 'Username for the user',
    example: 'user123',
    minLength: 4,
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  @MinLength(4, { message: 'Username must be at least 4 characters long.' })
  readonly username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'This field is required' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  readonly email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'Password123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'This field is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  readonly password: string;

  @ApiPropertyOptional({
    description: 'Roles assigned to the user (not needed for regular users',
    enum: Role,
    examples: {
      adminExample: {
        summary: 'Role for admin',
        value: Role.Admin,
      },
    },
  })
  @IsOptional()
  @IsString()
  readonly roles: Role;
}
