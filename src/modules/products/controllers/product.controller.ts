import { UpdateProductDto } from './../dtos/update-product.dto';
import { Controller, Query, Get, UseGuards, Body, Post, Patch, Param, Delete } from "@nestjs/common";
import { ProductService } from "../services";
import { JoiValidationPipe } from "@common/pipes";
import { BaseQueryParamsValidator } from "@common/validators";
import { BaseQueryParams } from "@common/dtos";
import { ResponseService } from "@shared/response/response.service";
import { AdminJwtAccessAuthGuard, JwtAccessAuthGuard, SalerJwtAccessAuthGuard } from "@modules/auth/guards";
import { CreateProductValidator } from "../validators";
import { CreateProductDto } from "../dtos/create-product.dto";
import { UpdateProductValidator } from '../validators/update-product.validator';
import { OrGuard } from '@nest-lab/or-guard';

@Controller('products')
export class ProductController {
    constructor(private readonly _productService: ProductService) {}

    @Get()
    async getAllProducts(
        @Query(new JoiValidationPipe(BaseQueryParamsValidator))
        query: BaseQueryParams 
    ) {
        const { count, data } = await this._productService.findAllProduct(query);
        return ResponseService.paginateResponse({
            count,
            data
        })
    }

    @Get(':id')
    async getProductsByCategory(
        @Param('id') id: string,
        @Query(new JoiValidationPipe(BaseQueryParamsValidator)) query: BaseQueryParams
    ) {
        const { count, data } = await this._productService.findByCategory_2(id, query);
        return ResponseService.paginateResponse({
            count,
            data
        })
    }

    @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard]))
    @Post('create-product')
    async createProduct(
        @Body(new JoiValidationPipe(CreateProductValidator))
        data: CreateProductDto
    ) {
        return await this._productService.create(data);
    }

    @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard]))
    @Patch('update-product/:id')
    async UpdateProduct(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(UpdateProductValidator))
        data: UpdateProductDto
    ) {
        return await this._productService.updateProduct(id,data);
    }

    @UseGuards(AdminJwtAccessAuthGuard)
    @Delete('delete-product/:id')
    async deleteProduct( @Param('id') id: string) {
        return await this._productService.deleteProduct(id);
    }
}