import { Controller, Get, Post, UseGuards, Body, Query, Req, Patch, Param, Delete, SetMetadata } from "@nestjs/common";

import { CategoryService } from "../services";
import { JoiValidationPipe } from "@common/pipes";
import { CreateCategoryValidator } from "../validators/create-category.validator";
import { CreateCategoryDto } from "../dtos";
import { JwtAccessAuthGuard, AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard } from "@modules/auth/guards";
import { BaseQueryParams } from "@common/dtos";
import { BaseQueryParamsValidator } from "@common/validators";
import { ResponseService } from "@shared/response/response.service";
import { UpdateCategoryValidator } from "../validators";
import { UpdateCategoryDto } from "../dtos/update-category.dto";
import { OrGuard } from "@nest-lab/or-guard";
import { AuthGuard } from "@nestjs/passport";
import { AdminJwtAccessStrategy, SalerJwtAccessStrategy } from "@modules/auth/strategies";

@Controller('category')
export class CategoryController {
    constructor(private readonly _categoryService: CategoryService) {}

    @Get()
    async getAllCategories(
        @Query(new JoiValidationPipe(BaseQueryParamsValidator))
        query: BaseQueryParams
    ) {
        const { count, data } = await this._categoryService.findAllCategories(query);

        return ResponseService.paginateResponse({
            count,
            data,
        });
    }

    @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard])) // TODO: Change to adminjwt
    // @UseGuards(AuthGuard([AdminJwtAccessAuthGuard, SalerJwtAccessStrategy]))
    // @UseGuards(OrGuardMixin(new AdminJwtAccessAuthGuard(), new SalerJwtAccessAuthGuard()))
    @Post('create-category')
    async createCategory(
        @Body(new JoiValidationPipe(CreateCategoryValidator)) data: CreateCategoryDto 
    ) {
        const category = await this._categoryService.create(data);
        return category;
    }

    // @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard])) // TODO: Change to adminjwt
    @Patch('update-category/:id')
    async updateCategory(
        @Param('id') id: string, 
        @Body(new JoiValidationPipe(UpdateCategoryValidator)) data: UpdateCategoryDto 
    ) {
        return await this._categoryService.updateCategory(id, data);
    }

    // @UseGuards(OrGuard([AdminJwtAccessAuthGuard, SalerJwtAccessAuthGuard]))
    @Delete('delete-category/:id')
    async deleteCategory(@Param('id') id: string) {
        return await this._categoryService.deleteCategory(id);
    }
}