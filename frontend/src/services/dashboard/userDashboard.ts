import axios, { AxiosResponse } from "axios";
import api from "../axios";
import formattedDate from "@/utils/formattedDate";
import { FormattedOrderType, OrderType } from "@/utils/types/OrderType";

interface DashboardResponse {
  message?: string;
  cartCount: number;
  orderCount: number;
  orderedProducts: OrderType[]; // sesuai respons backend
}

const formatOrderDates = (order: OrderType): FormattedOrderType => {
  return {
    ...order,
    created_at_formatted: formattedDate(new Date(order.created_at)),
    updated_at_formatted: formattedDate(new Date(order.updated_at)),
    deleted_at_formatted: order.deleted_at
      ? formattedDate(new Date(order.deleted_at))
      : undefined,
  };
};

const getDashboards = async (): Promise<{
  message?: string;
  cartCount: number;
  orderCount: number;
  orderedProducts: FormattedOrderType[];
}> => {
  try {
    const response: AxiosResponse<DashboardResponse> = await api.get(
      "/user/dashboard"
    );

    const products = response.data.orderedProducts || [];
    const productsFormatted = products.map(formatOrderDates);

    return {
      message: response.data.message,
      cartCount: response.data.cartCount,
      orderCount: response.data.orderCount,
      orderedProducts: productsFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Gagal mengambil data dashboard");
  }
};

const userDashboardService = {
  getDashboards,
};

export default userDashboardService;
