import formattedDate from "@/utils/formattedDate";
import { FormattedOrderType, OrderType } from "@/utils/types/OrderType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";

interface OrderResponse {
  message?: string;
  orders?: OrderType[]; // Array of products (for index endpoint)
  order?: OrderType; // Single product (for show/update endpoints)
  error?: string;
  status?: number;
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

const createOrder = async (
  data: FormData
): Promise<{
  error?: string;
  status: number;
  message?: string;
  orders?: OrderType[];
  ordersFormatted?: FormattedOrderType[];
}> => {
  try {
    console.log("FormData content:");
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
    const response: AxiosResponse<OrderResponse> = await api.post(
      "/order",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Get status code from response
    const status = response.status;

    // Format products if they exist in the response
    const ordersFormatted = response.data.orders
      ? response.data.orders.map(formatOrderDates)
      : [];

    return {
      error: response.data.error,
      status: status,
      message: response.data.message,
      orders: response.data.orders,
      ordersFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle validation errors (422 - Unprocessable Entity)
      if (error.response?.status === 422) {
        console.log("Validation errors:", error.response.data.errors); // <--- Tambahkan ini
        throw new Error(
          error.response.data.message || "Produk gagal dibuat: Data tidak valid"
        );
      }
      // Handle unauthorized errors (403 - Forbidden)
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk membuat produk");
      }
      // Handle other error responses
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.request && !error.response) {
        throw new Error("Tidak dapat terhubung ke server");
      }
      // Default error message
      throw new Error("Produk gagal dibuat: Terjadi kesalahan pada server");
    }
    // If error is not from axios
    throw new Error(
      "Produk gagal dibuat: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

const orderService = {
  createOrder,
};

export default orderService;
