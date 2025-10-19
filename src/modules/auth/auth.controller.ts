import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { RegisterDto } from '../users/dto/create-user.dto';
// import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
// import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
// import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  // 1. register()
  // 2. login()
  // 3. refresh()
  // 4. logout()
  // 5. profile()
}
