import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailArticleResponse = Nullable<{
  id: number;
  title: string;
  image: string;
  content: string;
  status: number;
}>;

export type ListArticleResponse = IPaginationResponse<{
  id: number;
  title: string;
  content: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;

export type CreateArticleResponse = {
  success: boolean;
  message: string;
};

export type UpdateArticleResponse = {
  success: boolean;
  message: string;
};
