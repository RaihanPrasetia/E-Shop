import formattedDate from "@/utils/formattedDate";
import {
  CartRequest,
  CartType,
  FormattedCartType,
} from "@/utils/types/CartType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";

interface CartResponse {
  message?: string;
  carts?: CartType[]; // Array of carts (for index endpoint)
  cart?: CartType; // Single cart (for show/update endpoints)
  error?: string;
  status?: number;
}

const formatCartDates = (cart: CartType): FormattedCartType => {
  return {
    ...cart,
    created_at_formatted: formattedDate(new Date(cart.created_at)),
    updated_at_formatted: formattedDate(new Date(cart.updated_at)),
    deleted_at_formatted: cart.deleted_at
      ? formattedDate(new Date(cart.deleted_at))
      : undefined,
  };
};

const getCarts = async (): Promise<{
  message?: string;
  carts: CartType[];
  cartsFormatted: FormattedCartType[];
}> => {
  try {
    const response: AxiosResponse<CartResponse> = await api.get("/cart");

    // Format dates for display
    const cartsFormatted = response.data.carts
      ? response.data.carts.map(formatCartDates)
      : [];

    return {
      message: response.data.message,
      carts: response.data.carts || [],
      cartsFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal mengambil data kategori");
  }
};

// create data cart
const createCart = async (
  data: CartRequest
): Promise<{
  error?: string;
  status?: number;
  message?: string;
  carts?: CartType[];
  cartsFormatted?: FormattedCartType[];
}> => {
  try {
    console.log("Data Cart yang di kirim :", data);
    const response: AxiosResponse<CartResponse> = await api.post("/cart", data);

    // Pengecekan status code dari response
    const status = response.status;

    if (status === 201) {
      // Jika status 201 (Created), format carts jika ada
      const cartsFormatted = response.data.carts
        ? response.data.carts.map(formatCartDates)
        : [];

      return {
        error: response.data.error,
        status: status,
        message: response.data.message,
        carts: response.data.carts,
        cartsFormatted,
      };
    } else {
      // Handle status selain 201 jika diperlukan
      throw new Error(`Unexpected status code: ${status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle validation errors (422 - Unprocessable Entity)
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message ||
            "Kategori gagal dibuat: Data tidak valid"
        );
      }
      // Handle unauthorized errors (403 - Forbidden)
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk membuat kategori");
      }
      // Handle other error responses
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle default error message if no other status matched
      throw new Error("Kategori gagal dibuat: Terjadi kesalahan pada server");
    }
    // Jika error bukan berasal dari axios
    throw new Error(
      "Kategori gagal dibuat: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

const updateCart = async (
  id: string,
  data: Partial<CartRequest>
): Promise<{
  status: number;
  message?: string;
  cart?: CartType;
  cartFormatted?: FormattedCartType;
}> => {
  try {
    const response: AxiosResponse<CartResponse> = await api.put(
      `/cart/${id}`,
      data
    );
    // Format dates for the updated cart
    const cartFormatted = response.data.cart
      ? formatCartDates(response.data.cart)
      : undefined;

    return {
      status: response.status,
      message: response.data.message,
      cart: response.data.cart,
      cartFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle validation errors
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message ||
            "Kategori gagal diperbarui: Data tidak valid"
        );
      }
      // Handle unauthorized errors
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk memperbarui kategori");
      }
      // Handle not found error
      if (error.response?.status === 404) {
        throw new Error("Kategori tidak ditemukan");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal memperbarui kategori");
  }
};

const deleteCart = async (
  id: string
): Promise<{
  status: number;
  message?: string;
}> => {
  try {
    const response: AxiosResponse<CartResponse> = await api.delete(
      `/cart/${id}`
    );

    return {
      status: response.status,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Define common error messages
      const errorMessages = {
        403: "Anda tidak memiliki izin untuk menghapus kategori",
        404: "Kategori tidak ditemukan",
        422: "Kategori ini tidak dapat dihapus karena masih memiliki produk terkait",
        default: "Gagal menghapus kategori",
      };

      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message ||
        errorMessages[status as keyof typeof errorMessages] ||
        errorMessages.default;

      // Return structured error response
      return {
        status: status,
        message: message,
      };
    }

    // Handle non-axios errors
    return {
      status: 500,
      message:
        "Gagal menghapus kategori: Terjadi kesalahan yang tidak diketahui",
    };
  }
};

const cartService = {
  getCarts,
  createCart,
  updateCart,
  deleteCart,
};

export default cartService;
