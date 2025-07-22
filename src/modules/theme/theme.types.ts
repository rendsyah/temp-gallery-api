import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailThemeResponse = Nullable<{
  id: number;
  name: string;
  desc: string;
  status: number;
}>;

export type OptionsThemeResponse = {
  id: number;
  name: string;
};

export type ListThemeResponse = IPaginationResponse<{
  id: number;
  name: string;
  desc: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
