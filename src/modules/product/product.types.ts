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
  sku: string;
  year: string;
  images: ProductImages[];
  width: number;
  length: number;
  unit: string;
  price: number;
  desc: string;
  status: number;
}>;

export type OptionsProductResponse = {
  id: number;
  name: string;
};

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
