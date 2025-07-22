import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailCategoryResponse = Nullable<{
  id: number;
  name: string;
  desc: string;
  status: number;
}>;

export type OptionsCategoryResponse = {
  id: number;
  name: string;
};

export type ListCategoryResponse = IPaginationResponse<{
  id: number;
  name: string;
  desc: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
