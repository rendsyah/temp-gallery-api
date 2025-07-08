import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateBannerSchema,
  UpdateBannerSchema,
  ListBannerSchema,
  DetailSchema,
} from './banner.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListBannerDto extends createZodCustomDto(ListBannerSchema) {}

export class CreateBannerDto extends createZodCustomDto(
  CreateBannerSchema,
  fileFieldDto('image', 'single', true),
) {}

export class UpdateBannerDto extends createZodCustomDto(
  UpdateBannerSchema,
  fileFieldDto('image', 'single', false),
) {}
