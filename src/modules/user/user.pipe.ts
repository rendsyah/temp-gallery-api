import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListUserSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'fullname', 'access_name', 'email', 'phone', 'status']).optional(),
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

export const CreateUserSchema = z.object({
  access_id: z.number().min(1),
  username: z.string().min(1).max(25).toLowerCase(),
  password: z.string().min(8).max(30),
  fullname: z.string().min(1).max(100),
  email: z.string().email().max(100).toLowerCase(),
  phone: z
    .string()
    .min(1)
    .max(25)
    .regex(/^(62|08|021)[0-9]{7,20}$/, 'Invalid phone number'),
});

export const UpdateUserSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateUserSchema)
  .omit({ username: true, password: true });

export const ListAccessSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'name', 'description', 'status']).optional(),
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

export const CreateAccessSchema = z.object({
  name: z.string().min(3),
  desc: z.string(),
  actions: z
    .array(
      z.object({
        privilege_id: z.number().min(1),
      }),
    )
    .min(1),
});

export const UpdateAccessSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateAccessSchema);
