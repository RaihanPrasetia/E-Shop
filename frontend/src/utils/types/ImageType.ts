export type ProductImage = {
  file?: File;
  id: string;
  product_id: string;
  file_path: string; // Hanya file_path gambar yang diambil
  is_primary: boolean;
};
