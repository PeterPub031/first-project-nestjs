import { AdminAuthController, AuthController } from './controllers';
import {
  JwtAccessStrategy,
  LocalStrategy,
} from './strategies';

import { AuthService } from './services';
import { EmailModule } from '@shared/email/email.module';
import { EmailService } from '@shared/email/email.service';
import { Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { UserRepository } from '@modules/user/repositories';
import { UserService } from '@modules/user/services';

@Module({
  imports: [UserModule, EmailModule],
  controllers: [AdminAuthController, AuthController],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    EmailService,
    // Passport strategies
    JwtAccessStrategy,
    // JwtRefreshStrategy,
    LocalStrategy,

    // Repositories
  ],
  exports: [AuthService],
})
export class AuthModule {}
