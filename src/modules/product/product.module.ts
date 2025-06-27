import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Products, ProductImages, ProductAwards } from 'src/datasources/entities';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Products, ProductImages, ProductAwards])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
