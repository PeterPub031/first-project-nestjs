import * as bcrypt from 'bcryptjs';

import {
  ACCESS_TOKEN,
  ADMIN_ACCESS_TOKEN,
  ADMIN_REFRESH_TOKEN,
  AFFILICATE_ACCESS_TOKEN,
  AFFILICATE_REFRESH_TOKEN,
  REFRESH_TOKEN,
} from '../constants';
import {
  GetStartedDto,
  JwtAccessPayload,
  JwtRefreshPayload,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos';
import { JwtPayload, SignOptions, decode, sign } from 'jsonwebtoken';

import { CONFIG_VAR } from '@config/index';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export type TokenType =
  | typeof ACCESS_TOKEN
  | typeof REFRESH_TOKEN
  | typeof AFFILICATE_ACCESS_TOKEN
  | typeof AFFILICATE_REFRESH_TOKEN
  | typeof ADMIN_ACCESS_TOKEN
  | typeof ADMIN_REFRESH_TOKEN;

@Injectable()
export class AuthService {
  private readonly _jwtKeys: {
    [ACCESS_TOKEN]: string;
    [REFRESH_TOKEN]: string;
    [ADMIN_ACCESS_TOKEN]: string;
    [ADMIN_REFRESH_TOKEN]: string;
  };

  private readonly _jwtOptions: {
    [ACCESS_TOKEN]: SignOptions;
    [REFRESH_TOKEN]: SignOptions;
    [ADMIN_ACCESS_TOKEN]: SignOptions;
    [ADMIN_REFRESH_TOKEN]: SignOptions;
  };

  constructor(private readonly _configService: ConfigService) {
    this._jwtKeys = {
      [ACCESS_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_SECRET,
        "default_secret"
      ),
      [REFRESH_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_REFRESH_SECRET,
        "default_secret"
      ),
      [ADMIN_ACCESS_TOKEN]: this._configService.get(
        CONFIG_VAR.ADMIN_JWT_SECRET,
        "default_secret"
      ),
      [ADMIN_REFRESH_TOKEN]: this._configService.get(
        CONFIG_VAR.ADMIN_JWT_REFRESH_SECRET,
        "default_secret"
      ),
    };

    this._jwtOptions = {
      [ACCESS_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_EXPIRES_IN),
      },
      [REFRESH_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_REFRESH_EXPIRES_IN),
      },
      [ADMIN_ACCESS_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_EXPIRES_IN),
      },
      [ADMIN_REFRESH_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_REFRESH_EXPIRES_IN),
      },
    };
  }

  /**
   * Register user with email and password
   * If user is already registered with social login, add local login provider
   */
  async register(data: RegisterDto) {
    return {};
  }

  /**
   * Login user with email and password
   */
  async login() {
    // check có roll, id not throw error
    // check có bi block ko, id not throw error
    // if ok, generate tokens (access + refresh)
  }

  async userRefreshToken() {}

  async adminRefreshToken() {}

  async changePassword() {}

  async forgotPassword(userId: string) {}

  async resetPassword(data: ResetPasswordDto) {}

  async adminGetStarted(data: GetStartedDto) {}

  async adminLogin() {
    
  }

  /** ============================== Passport ============================== */
  // For local strategy
  async validateUser(id: string, password: string) {
    // const user = await this._userService.findUserById(id, {
    //   loginProviders: true,
    // });
    // if (
    //   !user ||
    //   !user.password ||
    //   user.loginProviders.some((lp) => lp.provider !== LoginProviderType.LOCAL)
    // ) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }
    // const isPasswordValid = await this._comparePasswords(
    //   password,
    //   user.password
    // );
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Incorrect email or password');
    // }
    // return user;
  }
  /** ============================== Passport ============================== */

  /** ============================== General ============================== */
  async generateTokens() {}

  private async _hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async _comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private _signPayload(
    payload: JwtAccessPayload | JwtRefreshPayload,
    type: TokenType
  ) {
    return sign(payload, this._jwtKeys[type], this._jwtOptions[type]);
  }

  private _decodeToken(token: string): string | JwtPayload {
    return decode(token);
  }

  /** ============================== General ============================== */
}