import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListArtistSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'name', 'email', 'phone', 'status']).optional(),
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

export const CreateArtistSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().min(1).email().max(100).toLowerCase(),
  phone: z
    .string()
    .min(1)
    .max(25)
    .regex(/^(62|08|021)[0-9]{7,20}$/, 'Invalid phone number'),
  desc: z.string().min(1),
});

export const UpdateArtistSchema = z
  .object({
    id: z.preprocess((value) => Number(value), z.number().min(1)),
    status: z.preprocess((value) => Number(value), z.number().min(0).max(1)),
    is_update_image: z.preprocess((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    }, z.boolean()),
  })
  .merge(CreateArtistSchema);
