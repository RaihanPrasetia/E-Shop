import { FormattedBankType } from "./BankTypes";

export type PaymentMethodType = {
  id: string;
  name: string;
  description: string;
  banks: FormattedBankType[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type FormattedPaymentMethodType = Omit<
  PaymentMethodType,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at_formatted: string;
  updated_at_formatted: string;
  deleted_at_formatted?: string;
};

export interface PaymentMethodRequest {
  name: string;
  description?: string;
}
