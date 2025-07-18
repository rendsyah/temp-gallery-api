import { createZodCustomDto } from 'src/commons/zod';
import { LoginSchema, PermissionSchema } from './auth.pipe';

export class LoginDto extends createZodCustomDto(LoginSchema) {}

export class PermissionDto extends createZodCustomDto(PermissionSchema) {}
