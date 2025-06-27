import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListParamsSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'name', 'value', 'status']).optional(),
  sort: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().min(1).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('2025-06-01'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('2025-06-31'),
});

export const CreateParamsSchema = z.object({
  name: z.string().min(1).max(25).toUpperCase(),
  desc: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
});

export const UpdateParamsSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateParamsSchema);
