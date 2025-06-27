import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { SubCategoryService } from './sub_category.service';
import {
  CreateSubCategoryDto,
  DetailDto,
  ListSubCategoryDto,
  UpdateSubCategoryDto,
} from './sub_category.dto';
import {
  CreateSubCategoryResponse,
  DetailSubCategoryResponse,
  ListSubCategoryResponse,
  SubCategoryOptionsResponse,
  UpdateSubCategoryResponse,
} from './sub_category.types';

@ApiTags('Sub Category')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'sub-category',
  version: '1',
})
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail sub category' })
  async getDetailSubCategory(@Param() dto: DetailDto): Promise<DetailSubCategoryResponse> {
    return await this.subCategoryService.getDetailSubCategory(dto);
  }

  @Get('/options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sub category options' })
  async getSubCategoryOptions(): Promise<SubCategoryOptionsResponse[]> {
    return await this.subCategoryService.getSubCategoryOptions();
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list sub category' })
  async getListSubCategory(@Query() dto: ListSubCategoryDto): Promise<ListSubCategoryResponse> {
    return await this.subCategoryService.getListSubCategory(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sub category' })
  async createSubCategory(
    @Body() dto: CreateSubCategoryDto,
    @User() user: IUser,
  ): Promise<CreateSubCategoryResponse> {
    return await this.subCategoryService.createSubCategory(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sub category' })
  async updateSubCategory(
    @Body() dto: UpdateSubCategoryDto,
    @User() user: IUser,
  ): Promise<UpdateSubCategoryResponse> {
    return await this.subCategoryService.updateSubCategory(dto, user);
  }
}
