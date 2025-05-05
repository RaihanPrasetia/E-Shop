import { ProductType } from "./ProductType";

export type CartType = {
  id: string;
  user_id: string;
  cart_name: string;
  schedule: string;
  products: CartProductType[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export interface CartRequest {
  cart_name: string;
  schedule: string;
}
export interface CartItemRequest {
  cart_id: string;
  product_id: string;
  qty: number;
}

export type FormattedCartType = Omit<
  CartType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};

export type CartItemsType = {
  id: string;
  cart_id: string;
  product_id: string;
  products: ProductType[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type CartProductType = {
  cart_item_id: string;
  product_id: string;
  qty: number;
  description: string;
  name: string;
  price: string; // Jika harga disimpan dalam format string
  stock: number;
  category_id: string;
  is_featured: boolean;
  is_published: boolean;
  specifications: string; // Menyimpan spesifikasi produk dalam format JSON
  deleted_at?: string | null; // Bisa null jika belum dihapus
  created_at: string;
  updated_at: string;
  image_path?: string;
};
