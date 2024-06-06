import { AdminJwtAccessAuthGuard } from './../guards/admin-jwt-access-auth.guard';
import { JoiValidationPipe } from '@common/pipes';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChangePasswordDto, GetStartedDto, LoginDto, RefreshTokenDto } from '../dtos';
import { LocalAuthGuard } from '../guards';
import { AuthService } from '../services';
import { ChangePasswordValidator, GetStartedValidator, RefreshTokenValidator } from '../validators';
import { RequestUser } from '@common/decorators';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly _authService: AuthService) {}

  // @Post('get-started')
  // async getStarted(
  //   @Body(new JoiValidationPipe(GetStartedValidator)) data: GetStartedDto
  // ) {
  //   return this._authService.adminGetStarted(data);
  // }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this._authService.adminLogin(data);
  }

  @Post('refresh-token')
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    return this._authService.adminRefreshToken();
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Post('update-password')
  async updatePassword(
    @RequestUser('id') userId: string,
    @Body(new JoiValidationPipe(ChangePasswordValidator))
    data: ChangePasswordDto
  ) {
    return this._authService.changePassword(userId, data);
  }
}
