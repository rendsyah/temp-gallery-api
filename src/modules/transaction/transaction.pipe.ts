import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListTransactionSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(8))
    .optional()
    .describe(
      '0 -> pending, 1 -> waiting process, 2 -> process, 3 -> shipped, 4 -> delivered, 5 -> completed, 6 -> cancelled, 7 -> failed, 8 -> refunded',
    ),
  orderBy: z
    .enum(['id', 'name', 'email', 'phone', 'grand_total', 'transaction_status', 'transaction_date'])
    .optional(),
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

export const CreateTransactionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100).toLowerCase(),
  phone: z.string().regex(/^(62|08|021)[0-9]{7,20}$/, 'Invalid phone number'),
  message: z.string(),
  items: z
    .array(
      z.object({
        product_id: z.number().min(1),
        quantity: z.number().min(1),
        notes: z.string(),
      }),
    )
    .min(1),
});
