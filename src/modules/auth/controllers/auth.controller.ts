import { USER_ERRORS } from "./../../../content/errors/user.error";
import { RequestUser } from "./../../../common/decorators/request-user.decorator";
import { JoiValidationPipe } from "@common/pipes";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  JwtAccessPayload,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "../dtos";
import { JwtAccessAuthGuard, LocalAuthGuard } from "../guards";
import { AuthService } from "../services";
import {
  ChangePasswordValidator,
  ForgotPasswordValidator,
  LoginValidator,
  RefreshTokenValidator,
  RegisterValidator,
  ResetPasswordValidator,
} from "../validators";
import { User } from "@prisma/client";

@Controller("general/auth")
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post("register")
  async register(
    @Body(new JoiValidationPipe(RegisterValidator)) data: RegisterDto
  ) {
    return await this._authService.register(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Body(new JoiValidationPipe(LoginValidator)) data: LoginDto) {
    return this._authService.login(data);
  }

  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    return this._authService.userRefreshToken(data);
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body(new JoiValidationPipe(ForgotPasswordValidator))
    data: ForgotPasswordDto
  ) {
    const { email: email } = data;
    return this._authService.forgotPassword(email);
  }

  @Post("reset-password")
  async resetPassword(
    @Body(new JoiValidationPipe(ResetPasswordValidator)) data: ResetPasswordDto
  ) {
    return this._authService.resetPassword(data);
  }

  // After login
  @UseGuards(JwtAccessAuthGuard)
  @Post("update-password")
  async changePassword(
    @RequestUser("id") userId: string,
    @Body(new JoiValidationPipe(ChangePasswordValidator))
    data: ChangePasswordDto
  ) {
    return this._authService.changePassword(userId, data);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get("profile")
  async getOwnProfile(@RequestUser() user: User) {
    if (!user) {
      throw new BadRequestException(USER_ERRORS.USER_01);
    } else {
      delete user.forgotPasswordToken;
      return user;
    }
  }
}
