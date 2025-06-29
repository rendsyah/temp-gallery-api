import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailParamsResponse = Nullable<{
  id: number;
  name: string;
  desc: string;
  value: string;
  status: number;
}>;

export type ListParamsResponse = IPaginationResponse<{
  id: number;
  name: string;
  desc: string;
  value: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
