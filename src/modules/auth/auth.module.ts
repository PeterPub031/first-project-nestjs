import { AdminAuthController, AuthController } from "./controllers";
import {
  AdminJwtAccessStrategy,
  JwtAccessStrategy,
  LocalStrategy,
  SalerJwtAccessStrategy,
} from "./strategies";

import { AuthQueueService } from "./services/auth-queue.service";
import { AuthService } from "./services";
import { EmailModule } from "@shared/email/email.module";
import { EmailService } from "@shared/email/email.service";
import { Module } from "@nestjs/common";
import { QueueModule } from "@shared/queue/queue.module";
import { QueueService } from "@shared/queue/queue.service";
import { RedisModule } from "@nestjs-modules/ioredis";
import { SalerController } from "./controllers/saler-auth.controller";
import { UserModule } from "@modules/user/user.module";
import { UserRepository } from "@modules/user/repositories";
import { UserService } from "@modules/user/services";

@Module({
  imports: [UserModule, RedisModule],
  controllers: [AdminAuthController, AuthController, SalerController],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    AuthQueueService,
    // RedisService,
    // Passport strategies
    JwtAccessStrategy,
    AdminJwtAccessStrategy,
    SalerJwtAccessStrategy,
    // JwtRefreshStrategy,
    LocalStrategy,

    // Repositories
  ],
  exports: [AuthService, AuthQueueService],
})
export class AuthModule {}
