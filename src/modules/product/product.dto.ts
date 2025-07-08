import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateProductSchema,
  CreateProductAwardSchema,
  UpdateProductSchema,
  UpdateProductImageSchema,
  UpdateProductAwardSchema,
  ListProductSchema,
  DetailSchema,
} from './product.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListProductDto extends createZodCustomDto(ListProductSchema) {}

export class CreateProductDto extends createZodCustomDto(
  CreateProductSchema,
  fileFieldDto('images', 'multiple', true),
) {}

export class UpdateProductDto extends createZodCustomDto(UpdateProductSchema) {}

export class UpdateProductImageDto extends createZodCustomDto(
  UpdateProductImageSchema,
  fileFieldDto('images', 'multiple', false),
) {}

export class CreateProductAwardDto extends createZodCustomDto(CreateProductAwardSchema) {}

export class UpdateProductAwardDto extends createZodCustomDto(UpdateProductAwardSchema) {}
