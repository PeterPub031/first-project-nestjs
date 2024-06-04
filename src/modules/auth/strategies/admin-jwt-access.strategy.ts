import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '@modules/auth/services';
import { CONFIG_VAR } from '@config/index';
import { ConfigService } from '@nestjs/config';
import { JwtAccessPayload } from '../dtos';
import { PassportStrategy } from '@nestjs/passport';

export const ADMIN_JWT_ACCESS_STRATEGY = 'admin_jwt-access';

@Injectable()
export class AdminJwtAccessStrategy extends PassportStrategy(
  Strategy,
  ADMIN_JWT_ACCESS_STRATEGY
) {
  constructor(
    configService: ConfigService,
    public authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.ADMIN_JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    const isValidAdmin = await this.authService.validateAdminAccount(payload.id);
    return isValidAdmin;
  }
}
