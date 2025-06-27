import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateParamsSchema,
  UpdateParamsSchema,
  ListParamsSchema,
  DetailSchema,
} from './params.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListParamsDto extends createZodCustomDto(ListParamsSchema) {}

export class CreateParamsDto extends createZodCustomDto(CreateParamsSchema) {}

export class UpdateParamsDto extends createZodCustomDto(UpdateParamsSchema) {}
