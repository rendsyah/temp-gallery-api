import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type DetailContactResponse = Nullable<{
  id: number;
  name: string;
  email: string;
  phone: string;
  wa_phone: string;
  location: string;
  lat: string;
  lng: string;
  status: number;
}>;

export type ListContactResponse = IPaginationResponse<{
  id: number;
  name: string;
  email: string;
  phone: string;
  wa_phone: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
