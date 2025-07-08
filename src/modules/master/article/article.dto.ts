import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  ListArticleSchema,
  DetailSchema,
} from './article.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListArticleDto extends createZodCustomDto(ListArticleSchema) {}

export class CreateArticleDto extends createZodCustomDto(
  CreateArticleSchema,
  fileFieldDto('image', 'single', true),
) {}

export class UpdateArticleDto extends createZodCustomDto(
  UpdateArticleSchema,
  fileFieldDto('image', 'single', false),
) {}
