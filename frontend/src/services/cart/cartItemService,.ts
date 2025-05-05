import { CartItemRequest, CartType } from "@/utils/types/CartType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";

interface CartItemResponse {
  message?: string;
  data?: CartType;
  error?: string;
}

const createCartItem = async (
  data: CartItemRequest
): Promise<{
  error?: string;
  status?: number;
  message?: string;
}> => {
  try {
    console.log("Data Cart yang di kirim :", data);
    const response: AxiosResponse<CartItemResponse> = await api.post(
      "/cart-item",
      data
    );

    // Pengecekan status code dari response
    const status = response.status;

    if (status === 201) {
      return {
        error: response.data.error,
        status: status,
        message: response.data.message,
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

const updateCartItem = async (
  id: string,
  data: Partial<CartItemRequest>
): Promise<{
  error?: string;
  status?: number;
  message?: string;
}> => {
  try {
    const response: AxiosResponse<CartItemResponse> = await api.put(
      `/cart-item/${id}`,
      data
    );

    return {
      error: response.data.error,
      status: response.status,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        throw new Error(error.response.data.message || "Data tidak valid");
      }
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk memperbarui item");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Item gagal diperbarui: Terjadi kesalahan pada server");
    }

    throw new Error(
      "Item gagal diperbarui: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

const deleteCartItem = async (
  id: string
): Promise<{
  error?: string;
  status?: number;
  message?: string;
}> => {
  try {
    const response: AxiosResponse<CartItemResponse> = await api.delete(
      `/cart-item/${id}`
    );

    return {
      error: response.data.error,
      status: response.status,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Item tidak ditemukan");
      }
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk menghapus item");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Item gagal dihapus: Terjadi kesalahan pada server");
    }

    throw new Error(
      "Item gagal dihapus: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

const cartItemService = {
  createCartItem,
  deleteCartItem,
  updateCartItem,
};

export default cartItemService;
