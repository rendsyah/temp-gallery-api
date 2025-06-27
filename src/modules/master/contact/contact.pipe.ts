import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListContactSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'name', 'email', 'phone', 'wa_phone', 'status']).optional(),
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

export const CreateContactSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().min(1).email().max(100).toLowerCase(),
  phone: z
    .string()
    .min(1)
    .max(25)
    .regex(/^(62|08|021)[0-9]{7,20}$/, 'Invalid phone number'),
  wa_phone: z
    .string()
    .min(1)
    .max(25)
    .regex(/^(62|08|021)[0-9]{7,20}$/, 'Invalid whatsapp number'),
  location: z.string().min(1).max(255),
  lat: z.string().min(1).max(100),
  lng: z.string().min(1).max(100),
});

export const UpdateContactSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateContactSchema);
