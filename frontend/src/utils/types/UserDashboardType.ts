import { ProductType } from "./ProductType";

export type UserDashboardType = {
  cartCount: number;
  orderCount: number;
  products: ProductType[];
};
