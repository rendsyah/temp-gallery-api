import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

type TransactionItems = {
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  notes: string;
};

export type DetailTransactionResponse = Nullable<{
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  sub_total: string;
  shipping_fee: string;
  grand_total: string;
  transaction_items: TransactionItems[];
  transaction_status: number;
  transaction_date: string;
}>;

export type ListTransactionResponse = IPaginationResponse<{
  id: number;
  name: string;
  email: string;
  phone: string;
  grand_total: number;
  transaction_status: number;
  transaction_status_text: string;
  transaction_date: string;
}>;

export type CreateTransactionResponse = {
  success: boolean;
  message: string;
};
