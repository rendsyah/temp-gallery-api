import { z } from 'zod';

export const DetailSchema = z.object({
  id: z.preprocess((value) => Number(value), z.number().min(1)),
});

export const UpdateMenuSchema = z.object({
  id: z.number().min(1),
  name: z.string().min(1),
  sort: z.number().min(1),
  status: z.number().min(0).max(1),
});
