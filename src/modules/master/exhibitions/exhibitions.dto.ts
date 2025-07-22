import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateExhibitionSchema,
  UpdateExhibitionSchema,
  ListExhibitionSchema,
  DetailSchema,
} from './exhibitions.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListExhibitionDto extends createZodCustomDto(ListExhibitionSchema) {}

// MULTIPART/FORM-DATA
export class CreateExhibitionDto extends createZodCustomDto(
  CreateExhibitionSchema,
  fileFieldDto('image', 'single', true),
) {}

export class UpdateExhibitionDto extends createZodCustomDto(
  UpdateExhibitionSchema,
  fileFieldDto('image', 'single', false),
) {}
