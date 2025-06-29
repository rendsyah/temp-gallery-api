import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailBannerResponse = Nullable<{
  id: number;
  title: string;
  sub_title: string;
  image: string;
  type: string;
  placement_text_x: string;
  placement_text_y: string;
  sort: number;
  status: number;
}>;

export type GetBannerTypeResponse = {
  id: string;
  name: string;
};

export type ListBannerResponse = IPaginationResponse<{
  id: number;
  title: string;
  sub_title: string;
  type: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
