import { BadRequestException, Injectable } from "@nestjs/common";
import { CATEGORY_ERRORS, PRODUCT_ERRORS } from "src/content/errors";

import { BaseQueryParams } from "@common/dtos";
import { CategoryService } from "@modules/categories/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { ProductRepository } from "../repositories";
import { UpdateProductDto } from "../dtos/update-product.dto";

@Injectable()
export class ProductService {
    constructor(
        private readonly _productRepo: ProductRepository,
        private readonly _categoryService: CategoryService
    ) {}

    async create(data: CreateProductDto) {
        const category = await this._categoryService.findCategoryById(data.categoryId);
        if(!category) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03)
        }
        if(category.level == 2) {
            return await this._productRepo.create({
                name: data.name,
                description: data.description,
                price: data.price,
                details: data.details,
                color: data.color,
                imageURL: data.imageURL,
                category: {
                    connect: {
                        id: data.categoryId
                    }
                }
            });
        } else throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_02) 
    }

    async findAllProduct(query: BaseQueryParams) {
        const {page = 1, limit = 10} = query;
        const count = await this._productRepo.count({})
        const data = await this._productRepo.findAllProducts({
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            count,
            data
        };
    }
    
    async updateProduct(id: string, data: UpdateProductDto) {
        const product = await this._productRepo.findProductById({
            where: { id }
        });
        if(!product) {
            throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_01)
        }
        await this._productRepo.update({
            where: {
                id
            },
            data: {
                ...data,
            }
        })
        return 'Product has been updated successfully'
    }

    async deleteProduct(id: string) {
        const product = await this._productRepo.findProductById({where: {id}});
        if(!product) {
            throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_01);
        }
        await this._productRepo.delete({id});
        return 'Product has been deleted successfully'
    }
}