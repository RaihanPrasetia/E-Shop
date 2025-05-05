export type AuditTypes = {
  id: number;
  user_id: string | null;
  event: "created" | "updated" | "deleted";
  auditable_id: string;
  auditable_type: string;
  old_values: AuditValues;
  new_values: AuditValues;
  url: string;
  ip_address: string;
  user_agent: string;
  tags: string | null;
  created_at: string; // Will be formatted with fromattedDate
  updated_at: string; // Will be formatted with fromattedDate
  user: User | null;
};

export type AuditValues = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  role?: string;
  email_verified_at?: string;
  password?: string;
  remember_token?: string;
  isActive?: boolean;
  created_by?: string;
  metadata?: string;
};

export type FormattedAuditType = Omit<
  AuditTypes,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
  created_at: string;
};

type User = {
  name: string;
  role: string;
};
