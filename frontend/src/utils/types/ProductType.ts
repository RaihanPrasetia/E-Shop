// Add this to your types file to ensure proper typing

export interface SpecificationField {
  id: string;
  key: string;
  value: string;
}

export interface ProductVariant {
  id?: string;
  name: string;
  options: string | any[]; // Can be JSON string or array
  product_id?: string;
}

export interface ProductImage {
  id?: string;
  file?: File;
  file_path?: string;
  is_primary: boolean;
  product_id?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  specifications: string | object;
  is_published: boolean;
  is_featured: boolean;
  variants?: ProductVariant[];
  images?: ProductImage[];
  images_to_delete?: string[];
}

export type ProductType = {
  id: string;
  name: string;
  description: string;
  price: number; // Jika harga disimpan dalam format string
  stock: number;
  category_id: string; // Menyimpan id kategori
  is_featured: boolean;
  is_published: boolean;
  specifications: string; // Menyimpan spesifikasi produk dalam format JSON
  deleted_at?: string | null; // Bisa null jika belum dihapus
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
  };
  variants: ProductVariant[] | [];
  images: ProductImage[] | [];
  image_path?: string;
};

export type FormattedProductType = Omit<
  ProductType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};
