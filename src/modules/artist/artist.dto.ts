import { createZodCustomDto, fileFieldDto } from 'src/commons/zod';
import {
  CreateArtistSchema,
  UpdateArtistSchema,
  ListArtistSchema,
  DetailSchema,
} from './artist.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListArtistDto extends createZodCustomDto(ListArtistSchema) {}

export class CreateArtistDto extends createZodCustomDto(
  CreateArtistSchema,
  fileFieldDto('image', 'single', true),
) {}

export class UpdateArtistDto extends createZodCustomDto(
  UpdateArtistSchema,
  fileFieldDto('image', 'single', false),
) {}
