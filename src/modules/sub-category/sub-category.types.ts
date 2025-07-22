import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailSubCategoryResponse = Nullable<{
  id: number;
  category_id: number;
  name: string;
  desc: string;
  status: number;
}>;

export type OptionsSubCategoryResponse = {
  id: number;
  name: string;
};

export type ListSubCategoryResponse = IPaginationResponse<{
  id: number;
  name: string;
  desc: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
