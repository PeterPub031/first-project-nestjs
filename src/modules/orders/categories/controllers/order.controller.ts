import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Query,
  Req,
  Patch,
  Param,
  Delete,
  SetMetadata,
} from "@nestjs/common";

import { JoiValidationPipe } from "@common/pipes";
import { BaseQueryParams } from "@common/dtos";
import { BaseQueryParamsValidator } from "@common/validators";
import { ResponseService } from "@shared/response/response.service";
import { OrGuard } from "@nest-lab/or-guard";
import { OrderService } from "../services";
import { RequestUser } from "@common/decorators";
import { CreateOrderDto } from "../dtos";
import { JwtAccessAuthGuard } from "@modules/auth/guards";

@Controller("orders")
export class OrderController {
  constructor(private readonly _orderService: OrderService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post("create-order")
  async createOrder(
    @RequestUser("id") userId: string,
    @Body() data: CreateOrderDto
  ) {
    const order = await this._orderService.createOrder(data, userId);
    return order;
  }

  // @Get()
  // async getAllOrders() {
  //   await this._orderService.getAllOrders();
  // }

  //   @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard])) // TODO: Change to adminjwt
  //   // @UseGuards(AuthGuard([AdminJwtAccessAuthGuard, SalerJwtAccessStrategy]))
  //   // @UseGuards(OrGuardMixin(new AdminJwtAccessAuthGuard(), new SalerJwtAccessAuthGuard()))
  //   @Post("create-category")
  //   async createCategory(
  //     @Body(new JoiValidationPipe(CreateCategoryValidator))
  //     data: CreateCategoryDto
  //   ) {
  //     const category = await this._categoryService.create(data);
  //     return category;
  //   }

  //   // @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard])) // TODO: Change to adminjwt
  //   @Patch("update-category/:id")
  //   async updateCategory(
  //     @Param("id") id: string,
  //     @Body(new JoiValidationPipe(UpdateCategoryValidator))
  //     data: UpdateCategoryDto
  //   ) {
  //     return await this._categoryService.updateCategory(id, data);
  //   }

  //   // @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard]))
  //   @Delete("delete-category/:id")
  //   async deleteCategory(@Param("id") id: string) {
  //     return await this._categoryService.deleteCategory(id);
  //   }
}
