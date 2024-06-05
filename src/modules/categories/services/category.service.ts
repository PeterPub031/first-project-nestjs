import { BadRequestException, Injectable } from "@nestjs/common";

import { BaseQueryParams } from "@common/dtos";
import { CATEGORY_ERRORS } from 'src/content/errors/category.error';
import { CategoryRepository } from './../repositories/category.repository';
import { CreateCategoryDto } from '../dtos';
import { UpdateCategoryDto } from "../dtos/update-category.dto";

@Injectable()
export class CategoryService {
    constructor(private readonly _categoryRepo: CategoryRepository) {}

    async create(data: CreateCategoryDto) {
        if(!data.parentId){
            const category = await this._categoryRepo.create({name: data.name});
            return category;
        } 
        const parentCategory = await this._categoryRepo.findCategoryById({
            where: {
                id: data.parentId,
            },
        });
        if(!parentCategory) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_01);
        } 
        if(parentCategory.level == 2) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_02);
        }
        const category = await this._categoryRepo.create({
            name: data.name,
            parent: {
                connect: {id: data.parentId}
            },
            level: parentCategory.level + 1,                
        });
        return category;     
    }

    async findCategoryById(categoryId: string) {
        const category = await this._categoryRepo.findCategoryById({
            where: {
                id: categoryId,
            }
        });
        return category;
    }

    // async findCategoryByName(categoryName: string) {
    //     const category = await this._categoryRepo.findCategoryByName({
    //         where: {
    //             name: categoryName,
    //         }
    //     });
    //     return category;
    // }

    async findAllCategories(query: BaseQueryParams) {
        const {page = 1, limit = 10} = query;
        const count = await this._categoryRepo.count({})
        const data = await this._categoryRepo.findAllCategories({
            where: {
                level: 0,
            },
            include: {
                children: {
                    include: {
                        children: true,
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            count,
            data
        };
    }
    
    async updateCategory(id: string, data: UpdateCategoryDto) {
        const category = await this._categoryRepo.findCategoryById({
            where: { id }
        });
        if(!category) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03)
        }
        await this._categoryRepo.update({
            where: {
                id
            },
            data: {
                ...data,
            }
        })
        return 'Category has been updated successfully'
    }

    async deleteCategory(id: string) {
        const category = await this._categoryRepo
            .findOneOrThrowWInclude({id}, {children: true, products: true})
            .catch(() => { 
                throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03)
            })
        if(category.children.length > 0 || category.products.length > 0) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_04)
        }
        await this._categoryRepo.delete({id});
        return 'Category has been deleted successfully'
    }
}