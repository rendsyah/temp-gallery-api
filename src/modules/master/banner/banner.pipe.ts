import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const ListBannerSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'title', 'sub_title', 'type', 'status']).optional(),
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

export const CreateBannerSchema = z.object({
  title: z.string().min(1).max(100),
  sub_title: z.string().min(1).max(150),
  image: z.string().min(1),
  type: z.enum(['home', 'artists', 'artworks', 'exhibitions', 'contact', 'articles', 'others']),
  placement_text_x: z.enum(['left', 'center', 'right']),
  placement_text_y: z.enum(['top', 'center', 'bottom']),
  sort: z.number().min(1),
});

export const UpdateBannerSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
    is_update_image: z.boolean(),
  })
  .merge(CreateBannerSchema);
