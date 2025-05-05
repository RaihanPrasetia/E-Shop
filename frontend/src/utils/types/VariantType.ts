// export type VariantType = {
//   id?: string;
//   name: string;
//   options: string | string[]; // Menyimpan pilihan dalam format JSON
//   created_at: string;
//   updated_at: string;
//   deleted_at?: string | null;
// };

export interface VariantType {
  id?: string | null;
  name: string;
  options: string[] | string; // disimpan sebagai array, lalu diserialisasi saat submit
}
