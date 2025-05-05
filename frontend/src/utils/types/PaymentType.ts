export type ProductType = {
  id: string;
  name: string;
};

export type OrderItemType = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  variant_option: string | null;
  price: string;
  qty: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  product: ProductType;
};

export type OrderType = {
  id: string;
  user_id: string;
  total_price: string;
  total_qty: number;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemType[];
};

export type BankType = {
  id: string;
  name: string;
  no_rek: string;
  an: string;
  payment_method_id: string;
  isActive: boolean;
  user_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentType = {
  id: string;
  order_id: string;
  bank_id: string;
  amount: string;
  status: string;
  proof: string;
  payment_date: string;
  bank_name: string;
  bank_no_rek: string;
  bank_an: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  order: OrderType;
  bank: BankType;
};

export type FormattedPaymentType = Omit<
  PaymentType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};

export interface PaymentRequest {
  name: string;
  no_rek: string;
  an: string;
  isActive: boolean;
  payment_method_id?: string;
}
