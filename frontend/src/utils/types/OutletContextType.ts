import { FormattedOrderType } from "./OrderType";

export type OutletContextType = {
  cartCount: number;
  orderCount: number;
  orders: FormattedOrderType[] | [];
};
