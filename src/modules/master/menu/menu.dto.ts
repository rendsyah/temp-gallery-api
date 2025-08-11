import { createZodCustomDto } from 'src/commons/zod';
import { UpdateMenuSchema } from './menu.pipe';

export class UpdateMenuDto extends createZodCustomDto(UpdateMenuSchema) {}
