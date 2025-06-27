import { createZodCustomDto } from 'src/commons/zod';
import {
  CreateArtistSchema,
  UpdateArtistSchema,
  ListArtistSchema,
  DetailSchema,
} from './artist.pipe';

export class DetailDto extends createZodCustomDto(DetailSchema) {}

export class ListArtistDto extends createZodCustomDto(ListArtistSchema) {}

export class CreateArtistDto extends createZodCustomDto(CreateArtistSchema) {}

export class UpdateArtistDto extends createZodCustomDto(UpdateArtistSchema) {}
