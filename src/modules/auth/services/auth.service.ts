import * as bcrypt from "bcryptjs";

import {
  ACCESS_TOKEN,
  ADMIN_ACCESS_TOKEN,
  ADMIN_REFRESH_TOKEN,
  AFFILICATE_ACCESS_TOKEN,
  AFFILICATE_REFRESH_TOKEN,
  FORGOT_TOKEN,
  REFRESH_TOKEN,
  SALER_ACCESS_TOKEN,
  SALER_REFRESH_TOKEN,
} from "../constants";
import { AUTH_ERRORS, USER_ERRORS } from "src/content/errors";
import { AdminStatus, LoginProviderType, UserStatus } from "../enums";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  GetStartedDto,
  JwtAccessPayload,
  JwtRefreshPayload,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "../dtos";
import { JwtPayload, SignOptions, decode, sign } from "jsonwebtoken";

import { AuthQueueService } from "./auth-queue.service";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "../../../shared/email/email.service";
import { SalerStatus } from "../enums/saler-status.enum";
import { UserService } from "@modules/user/services";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { randomString } from "@common/utils";
import { MINUTE } from "@common/constants";

// import { RedisService } from '@shared/redis/redis.service';

export type TokenType =
  | typeof ACCESS_TOKEN
  | typeof REFRESH_TOKEN
  | typeof AFFILICATE_ACCESS_TOKEN
  | typeof AFFILICATE_REFRESH_TOKEN
  | typeof ADMIN_ACCESS_TOKEN
  | typeof ADMIN_REFRESH_TOKEN
  | typeof FORGOT_TOKEN
  | typeof SALER_ACCESS_TOKEN
  | typeof SALER_REFRESH_TOKEN;

@Injectable()
export class AuthService {
  private readonly _jwtKeys: {
    [ACCESS_TOKEN]: string;
    [REFRESH_TOKEN]: string;
    [ADMIN_ACCESS_TOKEN]: string;
    [ADMIN_REFRESH_TOKEN]: string;
    [FORGOT_TOKEN]: string;
    [SALER_ACCESS_TOKEN]: string;
    [SALER_REFRESH_TOKEN]: string;
  };

  private readonly _jwtOptions: {
    [ACCESS_TOKEN]: SignOptions;
    [REFRESH_TOKEN]: SignOptions;
    [ADMIN_ACCESS_TOKEN]: SignOptions;
    [ADMIN_REFRESH_TOKEN]: SignOptions;
    [FORGOT_TOKEN]: SignOptions;
    [SALER_ACCESS_TOKEN]: SignOptions;
    [SALER_REFRESH_TOKEN]: SignOptions;
  };

  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserService,
    // public readonly _mailerService: EmailService,
    private readonly _authQueueService: AuthQueueService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache // private readonly _redisService: RedisService
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
      [SALER_ACCESS_TOKEN]: this._configService.get(
        CONFIG_VAR.SALER_JWT_SECRET,
        "default_secret"
      ),
      [SALER_REFRESH_TOKEN]: this._configService.get(
        CONFIG_VAR.SALER_JWT_REFRESH_SECRET,
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
        expiresIn: this._configService.get(
          CONFIG_VAR.JWT_FORGOT_TOKEN_EXPIRES_IN
        ),
      },
      [SALER_ACCESS_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_EXPIRES_IN),
      },
      [SALER_REFRESH_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_REFRESH_EXPIRES_IN),
      },
    };
  }

  /**
   * Register user with email and password
   * If user is already registered with social login, add local login provider
   */
  async register(data: RegisterDto) {
    const account = await this._userService.findOneWithEmail(data.email);
    const hashedPassword = await this._hashPassword(data.password);
    if (account && account.deletedAt == null) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_02);
    } else {
      const user = await this._userService.create({
        ...data,
        password: hashedPassword,
        adminStatus: AdminStatus.BLOCKED,
        userStatus: UserStatus.ACTIVE,
        salerStatus: SalerStatus.BLOCKED,
        isAdmin: false,
        isUser: true,
        isSaler: false,
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
    if (account.isUser == false) {
      throw new ForbiddenException("This is not a user account");
    }
    // check có bi block ko, id not throw error
    else if (account.userStatus == UserStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    // if ok, generate tokens (access + refresh)
    else return await this.generateTokens(account);
  }

  async userRefreshToken(data: RefreshTokenDto) {
    const decodedToken = await this._decodeToken(data.refresh);
    let userId: string;
    if (typeof decodedToken === "string") {
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
    let isValid: boolean = await this._comparePasswords(
      data.currentPassword,
      account.password
    );
    if (isValid == false) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_03);
    } else {
      const hashedPassword = await this._hashPassword(data.password);
      await this._userService.updatePassWord(userId, hashedPassword);
      return "Password has been changed successfully";
    }
  }

  async forgotPassword(email: string) {
    const user = await this._userService.findOneWithEmail(email);
    if (!user) {
      throw new BadRequestException(USER_ERRORS.USER_01);
    }
    // const forgotToken = this._signPayload({ id: user.id }, FORGOT_TOKEN);

    // await this._userService.assignForgotPassword(user.id, forgotToken);
    // await this.cacheManager.set("my-cache-key", "123241", 36000);
    // const test = await this.cacheManager.get("my-cache-key");
    // console.log(test);
    const forgotToken = randomString(25);
    await this.cacheManager.set(forgotToken, user.id, 2 * MINUTE);
    await this._authQueueService.addJobSendForgotPasswordMail(
      forgotToken,
      email
    );
  }

  async resetPassword(data: ResetPasswordDto) {
    const userId: string = await this.cacheManager.get(data.code);
    if (!userId) {
      throw new NotFoundException("User Id not found");
    }
    // const decodedToken = this._decodeToken(data.code);
    // let userId: string;
    // if (typeof decodedToken === "string") {
    //   userId = decodedToken;
    // } else {
    //   userId = decodedToken.id;
    // }
    // await this.cacheManager.del(data.code);
    const user = await this._userService.findUserById(userId);
    console.log(user);
    if (!user) {
      throw new BadRequestException(USER_ERRORS.USER_01);
    }
    const hashedPassword = await this._hashPassword(data.password);
    await this._userService.updatePassWord(user.id, hashedPassword);
    return "Your password has been reset successfully";
  }

  // async adminGetStarted(data: GetStartedDto) {}

  async adminLogin(data: LoginDto) {
    const account = await this._userService.findUserById(data.id);
    // check có roll, id not throw error
    if (account.isAdmin == false) {
      throw new ForbiddenException("This is not a admin account");
    }
    // check có bi block ko, id not throw error
    if (account.adminStatus == AdminStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    // if ok, generate tokens (access + refresh)
    return await this.generateTokens(account);
  }

  async salerLogin(data: LoginDto) {
    const account = await this._userService.findUserById(data.id);
    // check có roll, id not throw error
    if (account.isSaler == false) {
      throw new ForbiddenException("This is not a saler account");
    }
    // check có bi block ko, id not throw error
    if (account.salerStatus == SalerStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    // if ok, generate tokens (access + refresh)
    return await this.generateTokens(account);
  }

  /** ============================== Passport ============================== */
  // For local strategy
  async validateUser(id: string, password: string) {
    const user = await this._userService.findUserById(id);
    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await this._comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect email or password");
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
    const accessTokenType = data.isAdmin
      ? ADMIN_ACCESS_TOKEN
      : data.isSaler
      ? SALER_ACCESS_TOKEN
      : ACCESS_TOKEN;
    const refreshTokenType = data.isAdmin
      ? ADMIN_REFRESH_TOKEN
      : data.isSaler
      ? SALER_REFRESH_TOKEN
      : REFRESH_TOKEN;
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
    if (admin.isAdmin == false) {
      throw new ForbiddenException("This is not a admin account");
    }
    // check có bi block ko, id not throw error
    if (admin.adminStatus == AdminStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    return admin;
  }

  async validateUserAccount(id: string) {
    const user = await this._userService.findUserById(id);
    if (user.isUser == false) {
      throw new ForbiddenException("This is not a user account");
    }
    // check có bi block ko, id not throw error
    if (user.userStatus == UserStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    return user;
  }

  async validateSalerAccount(id: string) {
    const saler = await this._userService.findUserById(id);
    if (saler.isSaler == false) {
      throw new ForbiddenException("This is not a saler account");
    }
    // check có bi block ko, id not throw error
    if (saler.salerStatus == SalerStatus.BLOCKED) {
      throw new ForbiddenException("This account has been blocked");
    }
    return saler;
  }

  /** ============================== General ============================== */
}
