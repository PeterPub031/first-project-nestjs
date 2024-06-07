import { ConfigModule, ConfigService } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";

import { AuthConsumer } from "./consumers/auth.consumer";
import { AuthModule } from "@modules/auth/auth.module";
import { BullModule } from "@nestjs/bull";
import { CONFIG_VAR } from "@config/config.constant";
import { QUEUE_NAMES } from "./constants";
import { QueueService } from "./queue.service";

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                console.log(config.get(CONFIG_VAR.REDIS_HOST), config.get(CONFIG_VAR.REDIS_PORT))
                return {
                    redis: {
                        host: config.get(CONFIG_VAR.REDIS_HOST),
                        port: config.get(CONFIG_VAR.REDIS_PORT),
                        // password: '123',
                    }
                }
            }
        }),
        BullModule.registerQueueAsync({ name: QUEUE_NAMES.AUTH_QUEUE }),
        AuthModule
    ],
    providers: [QueueService, AuthConsumer],
    exports: [QueueService]
})

export class QueueModule {}