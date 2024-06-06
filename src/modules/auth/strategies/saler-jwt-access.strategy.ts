import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '@modules/auth/services';
import { CONFIG_VAR } from '@config/index';
import { ConfigService } from '@nestjs/config';
import { JwtAccessPayload } from '../dtos';
import { PassportStrategy } from '@nestjs/passport';

export const SALER_JWT_ACCESS_STRATEGY = 'saler_jwt-access';

@Injectable()
export class SalerJwtAccessStrategy extends PassportStrategy(
  Strategy,
  SALER_JWT_ACCESS_STRATEGY
) {
  constructor(
    configService: ConfigService,
    public authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.SALER_JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    const isValidSaler = await this.authService.validateSalerAccount(payload.id);
    return isValidSaler;
  }
}
