import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateProductImageSchema,
  ListProductSchema,
  DetailSchema,
} from './product.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListProductDto extends createZodCustomDto(ListProductSchema) {}

export class UpdateProductDto extends createZodCustomDto(UpdateProductSchema) {}

// MULTIPART/FORM-DATA
export class CreateProductDto extends createZodCustomDto(
  CreateProductSchema,
  fileFieldDto('images', 'multiple', true),
) {}

export class UpdateProductImageDto extends createZodCustomDto(
  UpdateProductImageSchema,
  fileFieldDto('images', 'multiple', false),
) {}
