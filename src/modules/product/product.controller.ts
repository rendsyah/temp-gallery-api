import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ProductService } from './product.service';
import {
  CreateProductAwardDto,
  CreateProductDto,
  DetailDto,
  ListProductDto,
  UpdateProductAwardDto,
  UpdateProductDto,
  UpdateProductImageDto,
} from './product.dto';
import {
  CreateProductAwardResponse,
  CreateProductResponse,
  DeleteProductAwardResponse,
  DetailProductResponse,
  ListProductResponse,
  ProductAwardResponse,
  UpdateProductAwardResponse,
  UpdateProductImageResponse,
  UpdateProductResponse,
} from './product.types';

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
  @ApiOperation({ summary: 'Create product' })
  async createProduct(
    @Body() dto: CreateProductDto,
    @User() user: IUser,
  ): Promise<CreateProductResponse> {
    return await this.productService.createProduct(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Body() dto: UpdateProductDto,
    @User() user: IUser,
  ): Promise<UpdateProductResponse> {
    return await this.productService.updateProduct(dto, user);
  }

  @Patch('/image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product image' })
  async updateProductImage(
    @Body() dto: UpdateProductImageDto,
    @User() user: IUser,
  ): Promise<UpdateProductImageResponse> {
    return await this.productService.updateProductImage(dto, user);
  }

  @Get('/award/:product_id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product award' })
  async getProductAward(@Query() dto: DetailDto): Promise<ProductAwardResponse[]> {
    return await this.productService.getProductAward(dto);
  }

  @Post('/award')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product award' })
  async createProductAward(
    @Body() dto: CreateProductAwardDto,
    @User() user: IUser,
  ): Promise<CreateProductAwardResponse> {
    return await this.productService.createProductAward(dto, user);
  }

  @Patch('/award')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product award' })
  async updateProductAward(
    @Body() dto: UpdateProductAwardDto,
    @User() user: IUser,
  ): Promise<UpdateProductAwardResponse> {
    return await this.productService.updateProductAward(dto, user);
  }

  @Delete('/award/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product award' })
  async deleteProductAward(@Param() dto: DetailDto): Promise<DeleteProductAwardResponse> {
    return await this.productService.deleteProductAward(dto);
  }
}
