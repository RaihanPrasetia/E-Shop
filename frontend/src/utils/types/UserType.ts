// Updated UserType to match the actual API response structure
export type UserType = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  email_verified_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FormattedUserType = Omit<
  UserType,
  "created_at" | "updated_at" | "deleted_at" | "email_verified_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
  email_verified_at_formatted?: string;
};

// Request type for creating/updating users
export interface UserRequest {
  name: string;
  username?: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string | undefined;
  [key: string]: string | undefined; // Add index signature to allow string indexing
}
