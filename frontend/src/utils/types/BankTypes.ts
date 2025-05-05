import { PaymentMethodType } from "./PaymentMethodType";
import { UserType } from "./UserType";

export type BankType = {
  id: string;
  name: string;
  no_rek: string;
  an: string;
  payment_method_id: string;
  isActive: boolean;
  user_id: string;
  users: UserType;
  paymentMethods: PaymentMethodType[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type FormattedBankType = Omit<
  BankType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
  created_at: string;
  updated_at: string;
};

export interface BankRequest {
  name: string;
  no_rek: string;
  an: string;
  isActive: boolean;
  payment_method_id?: string;
}
