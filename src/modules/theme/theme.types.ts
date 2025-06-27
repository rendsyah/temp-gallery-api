import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailThemeResponse = Nullable<{
  id: number;
  name: string;
  desc: string;
  status: number;
}>;

export type ThemeOptionsResponse = {
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

export type CreateThemeResponse = {
  success: boolean;
  message: string;
};

export type UpdateThemeResponse = {
  success: boolean;
  message: string;
};
