import {
  FormattedPaymentType,
  PaymentRequest,
  PaymentType,
} from "@/utils/types/PaymentType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";
import formattedDate from "@/utils/formattedDate";

interface PaymentResponse {
  message?: string;
  payments: {
    current_page: number;
    data: PaymentType[];
    total: number;
    per_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  }; // Array of payments (for index endpoint)
  payment?: PaymentType; // Single payment (for show/update endpoints)
  error?: string;
  status?: number;
}

const formatPaymentDates = (product: PaymentType): FormattedPaymentType => ({
  ...product,
  created_at_formatted: formattedDate(new Date(product.created_at)),
  updated_at_formatted: formattedDate(new Date(product.updated_at)),
  deleted_at_formatted: product.deleted_at
    ? formattedDate(new Date(product.deleted_at))
    : undefined,
});

const createPayment = async (
  data: PaymentRequest
): Promise<{
  error?: string;
  status?: number;
  message?: string;
  payment?: PaymentType;
  paymentsFormatted?: FormattedPaymentType;
}> => {
  try {
    console.log("Data Payment yang dikirim:", data);

    const response: AxiosResponse<PaymentResponse> = await api.post(
      "/payment",
      data
    );

    const status = response.status;

    if (status === 201) {
      const paymentData = response.data.payment;

      const paymentsFormatted = paymentData
        ? formatPaymentDates(paymentData)
        : undefined;

      return {
        error: response.data.error,
        status,
        message: response.data.message,
        payment: paymentData,
        paymentsFormatted,
      };
    } else {
      throw new Error(`Unexpected status code: ${status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message ||
            "Gagal membuat payment: Data tidak valid"
        );
      }
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk membuat payment");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Gagal membuat payment: Terjadi kesalahan pada server");
    }

    throw new Error(
      "Gagal membuat payment: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

const getPayments = async ({
  page = 1,
  per_page = 5,
  search = "",
}: {
  page?: number;
  per_page?: number;
  search?: string;
} = {}): Promise<{
  message?: string;
  pagination: Omit<PaymentResponse["payments"], "data">;
  payments: PaymentType[];
  paymentsFormatted: FormattedPaymentType[];
}> => {
  try {
    const response: AxiosResponse<PaymentResponse> = await api.get("/payment", {
      params: {
        page,
        per_page,
        search,
      },
    });

    const payments = response.data.payments?.data || [];

    // Format dates for display
    const paymentsFormatted = payments.map(formatPaymentDates);
    const {
      current_page,
      total,
      per_page: perPage,
      last_page,
      next_page_url,
      prev_page_url,
    } = response.data.payments;
    return {
      message: response.data.message,
      payments,
      paymentsFormatted,
      pagination: {
        current_page,
        total,
        per_page: perPage,
        last_page,
        next_page_url,
        prev_page_url,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal mengambil data payment");
  }
};

const getPaymentById = async (
  id: string
): Promise<{
  payment?: PaymentType;
  paymentFormatted?: FormattedPaymentType;
  message?: string;
}> => {
  try {
    const response: AxiosResponse<PaymentResponse> = await api.get(
      `/payment/${id}`
    );

    const payment = response.data.payment;
    console.log(payment);
    const paymentFormatted = payment ? formatPaymentDates(payment) : undefined;

    return {
      message: response.data.message,
      payment,
      paymentFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Data payment tidak ditemukan");
      }
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk melihat data ini");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal mengambil detail payment");
  }
};

const updatePayment = async (
  id: string,
  data: Partial<PaymentRequest>
): Promise<{
  status: number;
  message?: string;
  payment?: PaymentType;
  paymentFormatted?: FormattedPaymentType;
}> => {
  try {
    const response: AxiosResponse<PaymentResponse> = await api.put(
      `/payment/${id}`,
      data
    );
    // Format dates for the updated payment
    const paymentFormatted = response.data.payment
      ? formatPaymentDates(response.data.payment)
      : undefined;

    return {
      status: response.status,
      message: response.data.message,
      payment: response.data.payment,
      paymentFormatted,
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

const deletePayment = async (id: string): Promise<{ message?: string }> => {
  try {
    const response: AxiosResponse<PaymentResponse> = await api.delete(
      `/payment/${id}`
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
      // Handle validation error (payment has related payments)
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

const paymentService = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentById,
};

export default paymentService;
