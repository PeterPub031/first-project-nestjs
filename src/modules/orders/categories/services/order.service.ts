import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateOrderDetailDto, CreateOrderDto } from "../dtos";

import { BaseQueryParams } from "@common/dtos";
import { OrderRepository } from "../repositories";
import { PRODUCT_ERRORS } from "src/content/errors";
import { ProductService } from "@modules/products/services";

@Injectable()
export class OrderService {
  constructor(
    private readonly _orderRepo: OrderRepository,
    private readonly _productService: ProductService
  ) {}

  async createOrder(data: CreateOrderDto, userId: string) {
    // const total = data.orderDetails.reduce((acc, detail) => {
    //   const productPrice = detail.productPrice;
    //   const productQuantity = detail.productQuantity;
    //   return acc + productPrice * productQuantity;
    // }, 0);
    const total = await this.getTotal(data.orderDetails);
    const checkedQuantity = await this.checkProductQuantity(data.orderDetails);
    if (checkedQuantity == false) {
      throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_03);
    }
    const order = await this._orderRepo.create({
      user: { connect: { id: userId } },
      ...data,
      total: total,
      orderDetails: {
        create: data.orderDetails.map(
          ({ productId, productName, productPrice, productQuantity }) => ({
            productId,
            productName,
            productPrice,
            productQuantity,
          })
        ),
      },
      trackingOrders: {
        create: {
          user: { connect: { id: userId } },
          status: data.status,
        },
      },
    });
    return order;
  }

  private async getTotal(
    orderDetails: CreateOrderDetailDto[]
  ): Promise<number> {
    return await orderDetails.reduce((acc, detail) => {
      const productPrice = detail.productPrice;
      const productQuantity = detail.productQuantity;
      return acc + productPrice * productQuantity;
    }, 0);
  }

  private async checkProductQuantity(
    orderDetails: CreateOrderDetailDto[]
  ): Promise<boolean> {
    const productIds = orderDetails.map((detail) => detail.productId);

    const products = await this._productService.findProductByIds(productIds);

    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    for (const detail of orderDetails) {
      const product = productMap[detail.productId];
      const requiredQuantity = detail.productQuantity;

      if (product.quantity < requiredQuantity) {
        return false;
      }
    }
  }

  // async getAllOrders(query: BaseQueryParams) {
  //   const { page = 1, limit = 10 } = query;
  //   const count = await this._orderRepo.count({});
  //   const data = await this._orderRepo.getAllOrders({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //   });
  //   return {
  //     count,
  //     data,
  //   };
  // }
  // async findorderById(orderId: string) {
  //   const order = await this._orderRepo.findorderById({
  //     where: {
  //       id: orderId,
  //     },
  //     include: {
  //       children: {
  //         include: {
  //           children: true,
  //         },
  //       },
  //     },
  //   });
  //   return order;
  // }

  //   async findAllCategories(query: BaseQueryParams) {
  //     const { page = 1, limit = 10 } = query;
  //     const count = await this._orderRepo.count({});
  //     const data = await this._orderRepo.findAllCategories({
  //       where: {
  //         level: 0,
  //       },
  //       include: {
  //         children: {
  //           include: {
  //             children: true,
  //           },
  //         },
  //       },
  //       skip: (page - 1) * limit,
  //       take: limit,
  //     });
  //     return {
  //       count,
  //       data,
  //     };
  //   }

  //   async updateorder(id: string, data: UpdateorderDto) {
  //     const order = await this._orderRepo.findorderById({
  //       where: { id },
  //     });
  //     if (!order) {
  //       throw new BadRequestException(order_ERRORS.order_03);
  //     }
  //     await this._orderRepo.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         ...data,
  //       },
  //     });
  //     return "order has been updated successfully";
  //   }

  //   async deleteorder(id: string) {
  //     const order = await this._orderRepo
  //       .findOneOrThrowWInclude({ id }, { children: true, products: true })
  //       .catch(() => {
  //         throw new BadRequestException(order_ERRORS.order_03);
  //       });
  //     if (order.children.length > 0 || order.products.length > 0) {
  //       throw new BadRequestException(order_ERRORS.order_04);
  //     }
  //     await this._orderRepo.delete({ id });
  //     return "order has been deleted successfully";
  //   }
}
