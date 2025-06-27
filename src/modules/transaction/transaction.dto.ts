import { createZodCustomDto } from 'src/commons/zod';
import { CreateTransactionSchema, ListTransactionSchema, DetailSchema } from './transaction.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListTransactionDto extends createZodCustomDto(ListTransactionSchema) {}

export class CreateTransactionDto extends createZodCustomDto(CreateTransactionSchema) {}
