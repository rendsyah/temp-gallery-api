import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Products, ProductImages, ProductAwards } from 'src/datasources/entities';
import { UploadWorkerModule } from 'src/workers/upload';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Products, ProductImages, ProductAwards]), UploadWorkerModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
