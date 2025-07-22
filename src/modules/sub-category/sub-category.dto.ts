import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateSubCategorySchema,
  UpdateSubCategorySchema,
  ListSubCategorySchema,
  DetailSchema,
  OptionsSubCategorySchema,
} from './sub-category.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class OptionsSubCategoryDto extends createZodCustomDto(OptionsSubCategorySchema) {}

export class ListSubCategoryDto extends createZodCustomDto(ListSubCategorySchema) {}

export class CreateSubCategoryDto extends createZodCustomDto(CreateSubCategorySchema) {}

export class UpdateSubCategoryDto extends createZodCustomDto(UpdateSubCategorySchema) {}
