import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { CategoryService } from './category.service';
import { CreateCategoryDto, DetailDto, ListCategoryDto, UpdateCategoryDto } from './category.dto';
import {
  DetailCategoryResponse,
  ListCategoryResponse,
  OptionsCategoryResponse,
} from './category.types';

@ApiTags('Category')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'category',
  version: '1',
})
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail category' })
  async getDetailCategory(@Param() dto: DetailDto): Promise<DetailCategoryResponse> {
    return await this.categoryService.getDetailCategory(dto);
  }

  @Get('/options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get options category' })
  async getOptionsCategory(): Promise<OptionsCategoryResponse[]> {
    return await this.categoryService.getOptionsCategory();
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list category' })
  async getListCategory(@Query() dto: ListCategoryDto): Promise<ListCategoryResponse> {
    return await this.categoryService.getListCategory(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.categoryService.createCategory(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(
    @Body() dto: UpdateCategoryDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.categoryService.updateCategory(dto, user);
  }
}
