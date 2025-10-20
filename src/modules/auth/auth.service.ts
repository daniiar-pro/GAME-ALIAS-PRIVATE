import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/infra/database/schemas';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Role } from 'src/shared/roles/role.enum';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly refreshDays: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {
    this.refreshDays = parseInt(this.cfg.get('JWT_REFRESH_DAYS') ?? '30', 10);
  }

  // Helpers
  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private signAccessToken(user: {
    id: string;
    username: string;
    roles?: Role[];
  }) {
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles ?? [Role.User],
    };
    return this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_SECRET', 'dev-secret'),
      expiresIn: this.cfg.get('JWT_EXPIRES', '900s'),
    });
  }

  private newRefreshToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(
      Date.now() + this.refreshDays * 24 * 60 * 60 * 1000,
    );
    return { token, tokenHash, expiresAt };
  }

  // Public API
  async signup(dto: SignUpDto) {
    const exists = await this.userModel.findOne({
      $or: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
    });

    if (exists) {
      throw new BadRequestException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const roles: Role[] = Array.isArray(dto.roles)
      ? (dto.roles as Role[])
      : dto.roles
        ? [dto.roles]
        : [Role.User];

    const created = await this.userModel.create({
      email: dto.email.toLowerCase(),
      username: dto.username,
      passwordHash,
      totalGames: 0,
      totalWins: 0,
      refreshTokens: [],
      roles,
    } as any);

    return {
      id: created._id,
      email: created.email,
      username: created.username,
      roles,
    };
  }

  async validateCredentials(usernameOrEmail: string, password: string) {
    const query = usernameOrEmail.includes('@')
      ? { email: usernameOrEmail.toLowerCase() }
      : { username: usernameOrEmail };

    const user = await this.userModel.findOne(query);

    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto, res: any) {
    const user = await this.validateCredentials(
      dto.usernameOrEmail,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signAccessToken({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: (user as any).id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      username: (user as any).username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      roles: (user as any).roles ?? [Role.User],
    });

    // rotate: issue a fresh refresh token
    const { token, tokenHash, expiresAt } = this.newRefreshToken();
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $push: {
          refreshTokens: { tokenHash, expiresAt, createAt: new Date() },
        },
      },
    );

    // httpOnly cookie
    const secure = (this.cfg.get('NODE_ENV') ?? 'development') === 'production';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.cookie('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      expires: expiresAt,
      path: '/auth', // limits CSRF surface
    });

    return {
      token: accessToken,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message: `Welcome ${(user as any).username}!`,
    };
  }

  async refresh(currentToken: string | undefined, res: any) {
    if (!currentToken) throw new UnauthorizedException('Missing refresh token');

    const tokenHash = this.hashToken(currentToken);
    const now = new Date();

    const user = await this.userModel.findOne({
      refreshTokens: { $elemMatch: { tokenHash, expiresAt: { $gt: now } } },
    });

    if (!user)
      throw new UnauthorizedException('Invalid/expiresd refresh token');

    // rotate: remove old, add new
    const { token, tokenHash: newHash, expiresAt } = this.newRefreshToken();
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $pull: { refreshTokens: { tokenHash } },
        $push: {
          refreshTokens: {
            tokenHash: newHash,
            expiresAt,
            createdAt: new Date(),
          },
        },
      },
    );

    const accessToken = this.signAccessToken({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: (user as any).id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      username: (user as any).username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      roles: (user as any).roles ?? [Role.User],
    });

    const secure = (this.cfg.get('NODE_ENV') ?? 'development') === 'production';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.cookie('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      expires: expiresAt,
      path: '/auth',
    });
    return { token: accessToken };
  }

  async logout(currentToken: string | undefined, res: any) {
    if (currentToken) {
      const tokenHash = this.hashToken(currentToken);
      await this.userModel.updateOne(
        {},
        { $pull: { refreshTokens: { tokenHash } } },
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.clearCookie('refreshToken', { path: '/path' });
    return { ok: true };
  }

  async logoutAll(userId: string, res: any) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokens: [] } },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.clearCookie('refreshToken', { path: '/auth' });
    return { ok: true, revoked: 'all' };
  }

  async me(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('_id email username role totalGames totalWins');
    return user
      ? {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          id: user.id,
          email: user.email,
          username: user.username,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          roles: (user as any).roles ?? [Role.User],
          totalGames: user.totalGames,
          totalWins: user.totalWins,
        }
      : null;
  }
}

// import { Injectable } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { JwtService } from '@nestjs/jwt';
// // import * as bcrypt from 'bcryptjs';
// // import * as crypto from 'node:crypto';

// @Injectable()
// export class AuthService {
//   private accessTtlSec: number;
//   private refreshTtlDays: number;
//   private cookieSecure: boolean;

//   constructor(
//     private readonly users: UsersService,
//     private readonly jwt: JwtService,
//   ) {}

//   // 1. register()
//   // 2. login()
//   // 3. refresh()
//   // 4. logout()
// }

// // 5. validateUser()
// // 6. signAccess()
// // 7. issueRefresh()
// // 8. setRefreshCookie()
// // 9. clearRefreshCookie()
