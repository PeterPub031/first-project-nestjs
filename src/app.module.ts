import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AllExceptionsFilter } from "@common/filters";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "@modules/auth/auth.module";
import { CacheModule } from "@nestjs/cache-manager";
import { CategoryModule } from "@modules/categories/category.module";
import { ConfigModule } from "@nestjs/config";
import { ConfigSchema } from "@config/config.schema";
import { EmailModule } from "@shared/email/email.module";
import { Environment } from "@common/enums";
import { Module } from "@nestjs/common";
import { OrderModule } from "@modules/orders/categories/order.module";
import { PrismaModule } from "@shared/prisma/prisma.module";
import { ProductModule } from "@modules/products/product.module";
import { QueueModule } from "@shared/queue/queue.module";
import { RedisModule } from "@nestjs-modules/ioredis";
import { ResponseModule } from "@shared/response/response.module";
import { ResponseTransformInterceptor } from "@common/interceptors";
import { UserModule } from "@modules/user/user.module";
import { redisStore } from "cache-manager-redis-yet";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || Environment.DEVELOPMENT}`,
      isGlobal: true,
      cache: true,
      validationSchema: ConfigSchema,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: "localhost", // hoặc URL Redis server
      port: 6379, // cổng Redis
      // ttl: 60, // Thời gian sống của cache tính bằng giây
    }),

    // Shared modules
    PrismaModule,
    ResponseModule,
    EmailModule,
    QueueModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
