import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailExhibitionResponse = Nullable<{
  id: number;
  artist_id: number;
  name: string;
  image: string;
  desc: string;
  start_date: string;
  end_date: string;
  status: number;
}>;

export type ListExhibitionResponse = IPaginationResponse<{
  id: number;
  name: string;
  desc: string;
  start_date: string;
  end_date: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
