// Updated CategoryType to match your data structure
export type CategoryType = {
  id: string;
  name: string;
  isActive: boolean;
  created_by: string;
  metadata: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type FormattedCategoryType = Omit<
  CategoryType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};

export interface CategoryRequest {
  name: string;
  isActive?: boolean;
  metadata?: string;
}

export interface MetadataField {
  key: string;
  value: string;
  id: string;
}
