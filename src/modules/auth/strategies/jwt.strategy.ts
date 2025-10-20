import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/shared/roles/role.enum';

type JwtPayload = {
  sub: string;
  username: string;
  roles?: Role[];
  iat: number;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get<string>('JWT_SECRET', 'dev-secret'),
      ignoreExpiration: false,
    });
  }
  validate(payload: JwtPayload) {
    // Attached to req.user
    return {
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles ?? [Role.User],
    };
  }
}
