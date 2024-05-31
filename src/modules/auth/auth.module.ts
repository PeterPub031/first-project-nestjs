import { AdminAuthController, AuthController } from './controllers';
import {
  JwtAccessStrategy,
  LocalStrategy,
} from './strategies';

import { AuthService } from './services';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AdminAuthController, AuthController],
  providers: [
    AuthService,

    // Passport strategies
    JwtAccessStrategy,
    // JwtRefreshStrategy,
    LocalStrategy,

    // Repositories
  ],
  exports: [AuthService],
})
export class AuthModule {}
