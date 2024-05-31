import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../services';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

export const LOCAL_STRATEGY = 'local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _authService: AuthService) {
    super({ usernameField: 'id', passwordField: 'password' });
  }

  async validate(username: string, password: string) {
    const user = await this._authService.validateUser(username, password);

    return user;
  }
}
