import { createZodCustomDto } from 'src/commons/zod';
import { CreateThemeSchema, UpdateThemeSchema, ListThemeSchema, DetailSchema } from './theme.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListThemeDto extends createZodCustomDto(ListThemeSchema) {}

export class CreateThemeDto extends createZodCustomDto(CreateThemeSchema) {}

export class UpdateThemeDto extends createZodCustomDto(UpdateThemeSchema) {}
