import { CategoryModule } from "@modules/categories/category.module";
import { CategoryService } from "@modules/categories/services";
import { Module } from "@nestjs/common";
import { ProductController } from "./controllers";
import { ProductRepository } from "./repositories";
import { ProductService } from "./services";

@Module({
    imports: [CategoryModule],
    providers: [ProductService, ProductRepository],
    controllers: [ProductController],
})

export class ProductModule {}