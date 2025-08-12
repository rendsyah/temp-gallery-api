import { createZodCustomDto } from 'src/commons/zod';
import { DetailSchema, UpdateMenuSchema } from './menu.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class UpdateMenuDto extends createZodCustomDto(UpdateMenuSchema) {}
