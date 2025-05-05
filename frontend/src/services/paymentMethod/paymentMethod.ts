import {
  FormattedPaymentMethodType,
  PaymentMethodRequest,
  PaymentMethodType,
} from "@/utils/types/PaymentMethodType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";
import formattedDate from "@/utils/formattedDate";

interface PaymentMethodResponse {
  message?: string;
  payment_methods?: PaymentMethodType[]; // Array of paymentMethods (for index endpoint)
  payment_method?: PaymentMethodType; // Single paymentMethod (for show/update endpoints)
  error?: string;
  status?: number;
}

const formatPaymentMethodDates = (
  paymentMethod: PaymentMethodType
): FormattedPaymentMethodType => {
  return {
    ...paymentMethod,
    created_at_formatted: formattedDate(new Date(paymentMethod.created_at)),
    updated_at_formatted: formattedDate(new Date(paymentMethod.updated_at)),
    deleted_at_formatted: paymentMethod.deleted_at
      ? formattedDate(new Date(paymentMethod.deleted_at))
      : undefined,
  };
};

const createPaymentMethod = async (
  data: PaymentMethodRequest
): Promise<{
  error?: string;
  status?: number;
  message?: string;
  payment_methods?: PaymentMethodType[];
  paymentMethodsFormatted?: FormattedPaymentMethodType[];
}> => {
  try {
    const response: AxiosResponse<PaymentMethodResponse> = await api.post(
      "/payment-method",
      data
    );

    // Pengecekan status code dari response
    const status = response.status;

    if (status === 201) {
      // Jika status 201 (Created), format paymentMethods jika ada
      const paymentMethodsFormatted = response.data.payment_methods
        ? response.data.payment_methods.map(formatPaymentMethodDates)
        : [];

      return {
        error: response.data.error,
        status: status,
        message: response.data.message,
        payment_methods: response.data.payment_methods,
        paymentMethodsFormatted,
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

const getPaymentMethods = async (): Promise<{
  message?: string;
  payment_methods: PaymentMethodType[];
  paymentMethodsFormatted: FormattedPaymentMethodType[];
}> => {
  try {
    const response: AxiosResponse<PaymentMethodResponse> = await api.get(
      "/payment-method"
    );
    console.log(response.data);
    // Format dates for display
    const paymentMethodsFormatted = response.data.payment_methods
      ? response.data.payment_methods.map(formatPaymentMethodDates)
      : [];

    return {
      message: response.data.message,
      payment_methods: response.data.payment_methods || [],
      paymentMethodsFormatted,
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

const updatePaymentMethod = async (
  id: string,
  data: Partial<PaymentMethodRequest>
): Promise<{
  status: string;
  message?: string;
  payment_method?: PaymentMethodType;
  paymentMethodFormatted?: FormattedPaymentMethodType;
}> => {
  try {
    const response: AxiosResponse<PaymentMethodResponse> = await api.put(
      `/paymentMethod/${id}`,
      data
    );
    // Format dates for the updated paymentMethod
    const paymentMethodFormatted = response.data.payment_method
      ? formatPaymentMethodDates(response.data.payment_method)
      : undefined;

    return {
      status: status,
      message: response.data.message,
      payment_method: response.data.payment_method,
      paymentMethodFormatted,
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

const deletePaymentMethod = async (
  id: string
): Promise<{ message?: string }> => {
  try {
    const response: AxiosResponse<PaymentMethodResponse> = await api.delete(
      `/paymentMethod/${id}`
    );

    return {
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle unauthorized errors
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk menghapus kategori");
      }
      // Handle not found error
      if (error.response?.status === 404) {
        throw new Error("Kategori tidak ditemukan");
      }
      // Handle validation error (paymentMethod has related paymentMethods)
      if (error.response?.status === 422) {
        throw new Error(
          "Kategori ini tidak dapat dihapus karena masih memiliki produk terkait"
        );
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal menghapus kategori");
  }
};

const paymentMethodService = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};

export default paymentMethodService;
