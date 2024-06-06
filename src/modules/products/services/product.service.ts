import { BadRequestException, Injectable } from "@nestjs/common";
import { CATEGORY_ERRORS, PRODUCT_ERRORS } from "src/content/errors";

import { BaseQueryParams } from "@common/dtos";
import { CategoryService } from "@modules/categories/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { ProductRepository } from "../repositories";
import { UpdateProductDto } from "../dtos/update-product.dto";
import { query } from 'express';

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
        if(category.level < 3 ) {
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

    async getCategoryIds(category) {
        const categoryIds = [category.id];

        if (category.children) {
            for (const child of category.children) {
                const childCategoryIds = await this.getCategoryIds(child);
                categoryIds.push(...childCategoryIds);
            }
        }
        return categoryIds;
    }
    
    // async findByCategory(categoryId: string, query: BaseQueryParams) {
    //     const category = await this._categoryService.findCategoryById(categoryId);
    //     console.log(category)
    //     if(!category) {
    //         throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03);
    //     }
    //     const categoryIds = await this.getCategoryIds(category)
    //     const {page = 1, limit = 10} = query;
    //     const count =  await this._productRepo.count({where: {categoryId: {in: categoryIds}}})
    //     const data = await this._productRepo.findAllProducts({
    //         where: { categoryId: {in: categoryIds}},
    //         skip: (page - 1) * limit,
    //         take: limit,
    //     });
    //     return {
    //         count, 
    //         data
    //     }
    // }

    async findByCategory(categoryId: string, query: BaseQueryParams) {
        // const category = await this._categoryService.findCategoryById(categoryId);
        // if(!category) {
        //     throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03);
        // }
        const {page = 1, limit = 10} = query;
        const [count, data] = await Promise.all([
            this._productRepo.count({
                where: {
                    OR: [
                        { categoryId: categoryId },
                        { category: { parentId: categoryId } },
                        { category: { parent: { parentId: categoryId } } }
                    ]
                }
            }),
            this._productRepo.findAllProducts({
                where: {
                    OR: [
                        {categoryId : categoryId},
                        {category: {parentId: categoryId}},
                        {category: {parent: {parentId: categoryId}}}
                    ]
                },
                skip: (page - 1) * limit,
                take: limit,
            })
        ])
        console.log(data)
        return {
            count, 
            data
        }
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