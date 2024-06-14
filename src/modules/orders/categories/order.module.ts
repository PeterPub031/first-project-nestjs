import { Module } from "@nestjs/common";
import { OrderController } from "./controllers/order.controller";
import { OrderRepository } from "./repositories";
import { OrderService } from "./services";
import { ProductModule } from "@modules/products/product.module";

@Module({
  imports: [ProductModule],
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
