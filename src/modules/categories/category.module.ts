import { AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard } from "@modules/auth/guards";

import { AdminJwtAccessStrategy } from "@modules/auth/strategies";
import { CategoryController } from "./controllers/category.controller";
import { CategoryRepository } from "./repositories";
import { CategoryService } from "./services";
import { Module } from "@nestjs/common";

@Module({
    providers: [CategoryService, CategoryRepository],
    controllers: [CategoryController],
    exports: [CategoryService]
})

export class CategoryModule {}