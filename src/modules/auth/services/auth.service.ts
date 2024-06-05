import * as bcrypt from 'bcryptjs';

import {
  ACCESS_TOKEN,
  ADMIN_ACCESS_TOKEN,
  ADMIN_REFRESH_TOKEN,
  AFFILICATE_ACCESS_TOKEN,
  AFFILICATE_REFRESH_TOKEN,
  FORGOT_TOKEN,
  REFRESH_TOKEN,
} from '../constants';
import { AUTH_ERRORS, USER_ERRORS } from 'src/content/errors';
import { AdminStatus, LoginProviderType, UserStatus } from '../enums';
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ChangePasswordDto,
  GetStartedDto,
  JwtAccessPayload,
  JwtRefreshPayload,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos';
import { JwtPayload, SignOptions, decode, sign } from 'jsonwebtoken';

import { CONFIG_VAR } from '@config/index';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../shared/email/email.service';
import { SalerStatus } from '../enums/saler-status.enum';
import { UserService } from '@modules/user/services';

export type TokenType =
  | typeof ACCESS_TOKEN
  | typeof REFRESH_TOKEN
  | typeof AFFILICATE_ACCESS_TOKEN
  | typeof AFFILICATE_REFRESH_TOKEN
  | typeof ADMIN_ACCESS_TOKEN
  | typeof ADMIN_REFRESH_TOKEN
  | typeof FORGOT_TOKEN

@Injectable()
export class AuthService {
  private readonly _jwtKeys: {
    [ACCESS_TOKEN]: string;
    [REFRESH_TOKEN]: string;
    [ADMIN_ACCESS_TOKEN]: string;
    [ADMIN_REFRESH_TOKEN]: string;
    [FORGOT_TOKEN]: string;
  };

  private readonly _jwtOptions: {
    [ACCESS_TOKEN]: SignOptions;
    [REFRESH_TOKEN]: SignOptions;
    [ADMIN_ACCESS_TOKEN]: SignOptions;
    [ADMIN_REFRESH_TOKEN]: SignOptions;
    [FORGOT_TOKEN]: SignOptions;
  };

  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserService,
    public readonly _mailerService: EmailService,
  ) {
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
      [FORGOT_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_FORGOT_SECRET,
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
      [FORGOT_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_FORGOT_TOKEN_EXPIRES_IN),
      },
    };
  }

  /**
   * Register user with email and password
   * If user is already registered with social login, add local login provider
   */
  async register(data: RegisterDto) {
    const account = await this._userService.findOneWithEmail(data.email);
    const hashedPassword = await this._hashPassword(data.password)
    if(account && account.deletedAt == null){
      throw new BadRequestException(AUTH_ERRORS.AUTH_02);
    }
    else {
        const user = await this._userService.create({
          ...data,
          password: hashedPassword,
          adminStatus: AdminStatus.BLOCKED,
          userStatus: UserStatus.ACTIVE,
          salerStatus: SalerStatus.BLOCKED,
          isAdmin: false,
          isUser: true,
          isSaler: false
      });
      return user;
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginDto) {
    const account = await this._userService.findUserById(data.id);
    // check có roll, id not throw error
    if(account.isUser == false) {
      throw new ForbiddenException('This is not a user account')
    }
    // check có bi block ko, id not throw error
    else if(account.userStatus == UserStatus.BLOCKED) {
      throw new ForbiddenException('This account has been blocked')
    }
    // if ok, generate tokens (access + refresh)
    else return await this.generateTokens(account);
  }

  async userRefreshToken(data: RefreshTokenDto) {
    const decodedToken = await this._decodeToken(data.refresh);
    let userId: string;
    if (typeof decodedToken === 'string') {
      userId = decodedToken;
    } else {
      userId = decodedToken.id;
    }
    const user = await this._userService.findUserById(userId);
    return await this.generateTokens(user);
  }

  async adminRefreshToken() {}

  async changePassword(userId: string, data: ChangePasswordDto) {
    const account = await this._userService.findUserById(userId);
    let isValid: boolean = await this._comparePasswords(data.currentPassword, account.password);
    if(isValid == false) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_03);
    } else { 
      const hashedPassword = await this._hashPassword(data.password);
      await this._userService.updatePassWord(userId, hashedPassword);
      return 'Password has been changed successfully'
    } 
  }

  async forgotPassword(email: string) {
    const user = await this._userService.findOneWithEmail(email);
    if (!user) {
      throw new BadRequestException(USER_ERRORS.USER_01);
    }
    const forgotToken = this._signPayload({id: user.id}, FORGOT_TOKEN );
    // await this._userService.assignForgotPassword(user.id, forgotToken);
    await this._mailerService.sendResetPasswordEmail(email, forgotToken);
  }

  async resetPassword(data: ResetPasswordDto) { 
    const decodedToken = this._decodeToken(data.code);
    let userId: string;
    if (typeof decodedToken === 'string') {
      userId = decodedToken;
    } else {
      userId = decodedToken.id;
    }
    const user = await this._userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException(USER_ERRORS.USER_01);
    }
    else {
      const hashedPassword = await this._hashPassword(data.password);
      await this._userService.updatePassWord(user.id, hashedPassword);
      return 'Your password has been reset successfully'
    }
  }

  // async adminGetStarted(data: GetStartedDto) {}

  async adminLogin(data: LoginDto) {
    const account = await this._userService.findUserById(data.id);
    // check có roll, id not throw error
    if(account.isAdmin == false) {
      throw new ForbiddenException('This is not a admin account')
    }
    // check có bi block ko, id not throw error
    if(account.adminStatus == AdminStatus.BLOCKED) {
      throw new ForbiddenException('This account has been blocked')
    }
    // if ok, generate tokens (access + refresh)
    return await this.generateTokens(account);
  }

  /** ============================== Passport ============================== */
  // For local strategy
  async validateUser(id: string, password: string) {
    const user = await this._userService.findUserById(id);
    if (
      !user ||
      !user.password)
    {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this._comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return user;
  }
  /** ============================== Passport ============================== */

  /** ============================== General ============================== */
  async generateTokens(data) {
    const fields = ["password", "createdAt", "updatedAt", "deletedAt"];
    for (const key of Object.keys(data)) {
      if (fields.includes(key)) {
        delete data[key];
      }
    } 
    const accessTokenType = data.isAdmin ? ADMIN_ACCESS_TOKEN : ACCESS_TOKEN;
    const refreshTokenType = data.isAdmin ? ADMIN_REFRESH_TOKEN : REFRESH_TOKEN;
    const [accessToken, refreshToken] = await Promise.all([
      this._signPayload(data, accessTokenType),
      this._signPayload({ id: data.id }, refreshTokenType),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

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

  async validateAdminAccount(id: string) {
    const admin = await this._userService.findUserById(id);
    if(admin.isAdmin == false) {
      throw new ForbiddenException('This is not a admin account')
    }
    // check có bi block ko, id not throw error
    if(admin.adminStatus == AdminStatus.BLOCKED) {
      throw new ForbiddenException('This account has been blocked')
    }
    return admin;
  }  

  async validateUserAccount(id: string) {
    const user = await this._userService.findUserById(id);
    if(user.isUser == false) {
      throw new ForbiddenException('This is not a user account')
    }
    // check có bi block ko, id not throw error
    if(user.userStatus == UserStatus.BLOCKED) {
      throw new ForbiddenException('This account has been blocked')
    }
    return user;
  }  

  /** ============================== General ============================== */
}
