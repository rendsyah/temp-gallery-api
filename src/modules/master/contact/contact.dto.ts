import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateContactSchema,
  UpdateContactSchema,
  ListContactSchema,
  DetailSchema,
} from './contact.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListContactDto extends createZodCustomDto(ListContactSchema) {}

export class CreateContactDto extends createZodCustomDto(CreateContactSchema) {}

export class UpdateContactDto extends createZodCustomDto(UpdateContactSchema) {}
