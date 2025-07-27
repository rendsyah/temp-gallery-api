import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';
import { FilePipe } from 'src/commons/pipes';
import { multerOptions } from 'src/commons/multer';

import { ProductService } from './product.service';
import {
  CreateProductDto,
  DetailDto,
  ListProductDto,
  UpdateProductDto,
  UpdateProductImageDto,
} from './product.dto';
import { DetailProductResponse, ListProductResponse } from './product.types';

@ApiTags('Product')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'product',
  version: '1',
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail product' })
  async getDetailProduct(@Param() dto: DetailDto): Promise<DetailProductResponse> {
    return await this.productService.getDetailProduct(dto);
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list product' })
  async getListProduct(@Query() dto: ListProductDto): Promise<ListProductResponse> {
    return await this.productService.getListProduct(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create product' })
  @UseInterceptors(
    FilesInterceptor('images', 5, multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles(FilePipe) images: Express.Multer.File[],
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.productService.createProduct(dto, images, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Body() dto: UpdateProductDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.productService.updateProduct(dto, user);
  }

  @Patch('/image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update product image' })
  @UseInterceptors(
    FilesInterceptor('images', 5, multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async updateProductImage(
    @Body() dto: UpdateProductImageDto,
    @UploadedFiles(FilePipe) images: Express.Multer.File[],
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.productService.updateProductImage(dto, images, user);
  }
}
