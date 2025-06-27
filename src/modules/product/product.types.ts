import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

type ProductImages = {
  id: number;
  image: string;
};

export type DetailProductResponse = Nullable<{
  id: number;
  artist_id: number;
  theme_id: number;
  category_id: number;
  sub_category_id: number;
  name: string;
  year: string;
  images: ProductImages[];
  width: number;
  length: number;
  unit: string;
  price: number;
  desc: string;
  status: number;
}>;

export type ListProductResponse = IPaginationResponse<{
  id: number;
  artist_name: string;
  theme_name: string;
  category_name: string;
  name: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;

export type CreateProductResponse = {
  success: boolean;
  message: string;
};

export type UpdateProductResponse = {
  success: boolean;
  message: string;
};

export type ProductAwardResponse = {
  id: number;
  title: string;
  desc: string;
  year: string;
};

export type CreateProductAwardResponse = {
  success: boolean;
  message: string;
  awards: ProductAwardResponse[];
};

export type UpdateProductAwardResponse = {
  success: boolean;
  message: string;
};

export type DeleteProductAwardResponse = {
  success: boolean;
  message: string;
};

export type UpdateProductImageResponse = {
  success: boolean;
  message: string;
};
