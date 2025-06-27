import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  ListCategorySchema,
  DetailSchema,
} from './category.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListCategoryDto extends createZodCustomDto(ListCategorySchema) {}

export class CreateCategoryDto extends createZodCustomDto(CreateCategorySchema) {}

export class UpdateCategoryDto extends createZodCustomDto(UpdateCategorySchema) {}
