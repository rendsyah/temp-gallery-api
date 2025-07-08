import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListProductSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z
    .enum(['id', 'artist_name', 'theme_name', 'category_name', 'name', 'status'])
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

export const CreateProductSchema = z.object({
  artist_id: z.preprocess((value) => Number(value), z.number().min(1)),
  theme_id: z.preprocess((value) => Number(value), z.number().min(1)),
  category_id: z.preprocess((value) => Number(value), z.number().min(1)),
  sub_category_id: z.preprocess((value) => Number(value), z.number().min(1)),
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(100).toUpperCase(),
  year: z
    .string()
    .length(4, { message: 'Year must be 4 digits' })
    .regex(/^\d{4}$/, { message: 'Invalid year' }),
  width: z.preprocess((value) => Number(value), z.number().min(1)),
  length: z.preprocess((value) => Number(value), z.number().min(1)),
  unit: z.enum(['cm']),
  price: z.preprocess((value) => Number(value), z.number().min(0)),
  desc: z.string().min(1),
});

export const UpdateProductSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateProductSchema);

export const UpdateProductImageSchema = z.object({
  product_id: z.preprocess((value) => Number(value), z.number().min(1)),
  image_ids: z
    .preprocess(
      (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return value;
      },
      z.array(z.number().min(1)),
    )
    .optional()
    .describe('Array of image IDs. Send as JSON string in multipart: "[1,2,3]"'),
});

export const CreateProductAwardSchema = z.object({
  product_id: z.number().min(1),
  awards: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        desc: z.string(),
        year: z
          .string()
          .length(4, { message: 'Year must be 4 digits' })
          .regex(/^\d{4}$/, { message: 'Invalid year' }),
      }),
    )
    .min(1),
});

export const UpdateProductAwardSchema = z.object({
  id: z.number().min(1),
  title: z.string().min(1).max(100),
  desc: z.string(),
  year: z
    .string()
    .length(4, { message: 'Year must be 4 digits' })
    .regex(/^\d{4}$/, { message: 'Invalid year' }),
});
