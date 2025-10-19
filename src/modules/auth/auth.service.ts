import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcryptjs';
// import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
  private accessTtlSec: number;
  private refreshTtlDays: number;
  private cookieSecure: boolean;

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // 1. register()
  // 2. login()
  // 3. refresh()
  // 4. logout()
  // 5. validateUser()
  // 6. signAccess()
  // 7. issueRefresh()
  // 8. setRefreshCookie()
  // 9. clearRefreshCookie()
}
