import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateAccessSchema,
  CreateUserSchema,
  DetailSchema,
  ListAccessSchema,
  ListUserSchema,
  UpdateAccessSchema,
  UpdateUserSchema,
} from './user.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListUserDto extends createZodCustomDto(ListUserSchema) {}

export class CreateUserDto extends createZodCustomDto(CreateUserSchema) {}

export class UpdateUserDto extends createZodCustomDto(UpdateUserSchema) {}

export class ListAccessDto extends createZodCustomDto(ListAccessSchema) {}

export class CreateAccessDto extends createZodCustomDto(CreateAccessSchema) {}

export class UpdateAccessDto extends createZodCustomDto(UpdateAccessSchema) {}
