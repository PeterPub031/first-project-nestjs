import { DefaultArgs } from "@prisma/client/runtime/library";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@shared/prisma/prisma.service";

@Injectable()
export class OrderRepository {
  private readonly _model: Prisma.OrderDelegate<DefaultArgs>;
  constructor(private readonly _prismaService: PrismaService) {
    this._model = this._prismaService.order;
  }

  async create(data: Prisma.OrderCreateInput) {
    return this._model.create({ data });
  }

  //   async findCategoryById(params: Prisma.CategoryFindFirstArgs) {
  //     return this._model.findFirst(params);
  //   }

  //   async findCategoryByName(params: Prisma.CategoryFindFirstOrThrowArgs) {
  //     return this._model.findFirstOrThrow(params);
  //   }

  async getAllOrders(params: Prisma.OrderFindManyArgs) {
    return this._model.findMany(params);
  }

  //   async findOneOrThrowWInclude(
  //     where: Prisma.CategoryWhereInput,
  //     include: Prisma.CategoryInclude | null
  //   ) {
  //     return this._model.findFirstOrThrow({
  //       where,
  //       include,
  //     });
  //   }

  async count(params: Prisma.OrderCountArgs) {
    return this._model.count(params);
  }

  //   async update(params: Prisma.CategoryUpdateArgs) {
  //     return this._model.update(params);
  //   }

  //   async delete(where: Prisma.CategoryWhereUniqueInput) {
  //     return this._model.delete({ where });
  //   }
}
