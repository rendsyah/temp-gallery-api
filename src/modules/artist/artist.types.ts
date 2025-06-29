import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailArtistResponse = Nullable<{
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
  desc: string;
  status: number;
}>;

export type ArtistOptionsResponse = {
  id: number;
  name: string;
};

export type ListArtistResponse = IPaginationResponse<{
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
