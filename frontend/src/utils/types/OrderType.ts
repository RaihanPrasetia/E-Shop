export type OrderType = {
  id: string;
  total_price: string;
  order_items: OrderItemType[];
  status: string;
  deleted_at?: string | null; // Bisa null jika belum dihapus
  created_at: string;
  updated_at: string;
};

export type OrderItemType = {
  id: string;
  product_id: string;
  qty: number;
  product_name: string;
  variant_name: string;
  variant_option: string;
  price: string;
  deleted_at?: string | null; // Bisa null jika belum dihapus
  created_at: string;
  updated_at: string;
};

export type FormattedOrderType = Omit<
  OrderType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};

export type OrderRequest = {
  items: {
    product_id: string;
    product_name: string;
    variant_name?: string;
    variant_option?: string;
    price: number;
    qty: number;
  }[];
  total_qty: number;
  total_price: number;
  status: "pending" | "paid" | "cancelled" | "shipped";
  bank_id: string;
  payment_date: string; // format: 'YYYY-MM-DD'
  proof?: File; // opsional, jika ada bukti transfer berupa file gambar
};
