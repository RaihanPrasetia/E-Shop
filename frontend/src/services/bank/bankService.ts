import {
  FormattedBankType,
  BankRequest,
  BankType,
} from "@/utils/types/BankTypes";
import axios, { AxiosResponse } from "axios";
import api from "../axios";
import formattedDate from "@/utils/formattedDate";

interface BankResponse {
  message?: string;
  banks?: BankType[]; // Array of banks (for index endpoint)
  bank?: BankType; // Single bank (for show/update endpoints)
  error?: string;
  status?: number;
}

const formatBankDates = (bank: BankType): FormattedBankType => {
  return {
    ...bank,
    created_at_formatted: formattedDate(new Date(bank.created_at)),
    updated_at_formatted: formattedDate(new Date(bank.updated_at)),
    deleted_at_formatted: bank.deleted_at
      ? formattedDate(new Date(bank.deleted_at))
      : undefined,
  };
};

const createBank = async (
  data: BankRequest
): Promise<{
  error?: string;
  status?: number;
  message?: string;
  banks?: BankType[];
  banksFormatted?: FormattedBankType[];
}> => {
  try {
    console.log("Data Bank yang di kirim :", data);
    const response: AxiosResponse<BankResponse> = await api.post("/bank", data);

    // Pengecekan status code dari response
    const status = response.status;

    if (status === 201) {
      // Jika status 201 (Created), format banks jika ada
      const banksFormatted = response.data.banks
        ? response.data.banks.map(formatBankDates)
        : [];

      return {
        error: response.data.error,
        status: status,
        message: response.data.message,
        banks: response.data.banks,
        banksFormatted,
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

const getBanks = async (): Promise<{
  message?: string;
  banks: BankType[];
  banksFormatted: FormattedBankType[];
}> => {
  try {
    const response: AxiosResponse<BankResponse> = await api.get("/bank");

    // Format dates for display
    const banksFormatted = response.data.banks
      ? response.data.banks.map(formatBankDates)
      : [];

    return {
      message: response.data.message,
      banks: response.data.banks || [],
      banksFormatted,
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

const updateBank = async (
  id: string,
  data: Partial<BankRequest>
): Promise<{
  status: number;
  message?: string;
  bank?: BankType;
  bankFormatted?: FormattedBankType;
}> => {
  try {
    const response: AxiosResponse<BankResponse> = await api.put(
      `/bank/${id}`,
      data
    );
    // Format dates for the updated bank
    const bankFormatted = response.data.bank
      ? formatBankDates(response.data.bank)
      : undefined;

    return {
      status: response.status,
      message: response.data.message,
      bank: response.data.bank,
      bankFormatted,
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

const deleteBank = async (id: string): Promise<{ message?: string }> => {
  try {
    const response: AxiosResponse<BankResponse> = await api.delete(
      `/bank/${id}`
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
      // Handle validation error (bank has related banks)
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

const bankService = {
  getBanks,
  createBank,
  updateBank,
  deleteBank,
};

export default bankService;
