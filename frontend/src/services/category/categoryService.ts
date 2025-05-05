import axios, { AxiosResponse } from "axios";
import api from "../axios";
import {
  CategoryRequest,
  CategoryType,
  FormattedCategoryType,
} from "@/utils/types/CategoryType";
import formattedDate from "@/utils/formattedDate";

interface CategoryResponse {
  message?: string;
  categories?: CategoryType[]; // Array of categories (for index endpoint)
  category?: CategoryType; // Single category (for show/update endpoints)
  error?: string;
  status?: number;
}

/**
 * Format category dates
 */
const formatCategoryDates = (category: CategoryType): FormattedCategoryType => {
  return {
    ...category,
    created_at_formatted: formattedDate(new Date(category.created_at)),
    updated_at_formatted: formattedDate(new Date(category.updated_at)),
    deleted_at_formatted: category.deleted_at
      ? formattedDate(new Date(category.deleted_at))
      : undefined,
  };
};

/**
 * Create a new category
 */
const createCategory = async (
  data: CategoryRequest
): Promise<{
  status: number;
  message?: string;
  categories?: CategoryType[];
  categoriesFormatted?: FormattedCategoryType[];
}> => {
  try {
    const response: AxiosResponse<CategoryResponse> = await api.post(
      "/category",
      data
    );

    // Get status code from response
    const status = response.status;

    // Format categories if available
    const categoriesFormatted = response.data.categories
      ? response.data.categories.map(formatCategoryDates)
      : [];

    return {
      status: status,
      message: response.data.message,
      categories: response.data.categories,
      categoriesFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Define common error messages
      const errorMessages = {
        422: "Kategori gagal dibuat: Data tidak valid",
        403: "Anda tidak memiliki izin untuk membuat kategori",
        409: "Kategori dengan nama ini sudah ada",
        default: "Kategori gagal dibuat: Terjadi kesalahan pada server",
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

    // Handle non-axios errors with a default status
    return {
      status: 500,
      message: "Kategori gagal dibuat: Terjadi kesalahan yang tidak diketahui",
    };
  }
};

/**
 * Get all categories
 */
const getCategories = async ({
  withDeleted = false,
  onlyDeleted = false,
  is_active = null,
}: {
  withDeleted?: boolean;
  onlyDeleted?: boolean;
  is_active?: boolean | null;
} = {}): Promise<{
  message?: string;
  categories: CategoryType[];
  categoriesFormatted: FormattedCategoryType[];
}> => {
  try {
    const params: Record<string, any> = {};

    if (onlyDeleted) {
      params.only_deleted = true;
    } else if (withDeleted) {
      params.with_deleted = true;
    }

    if (is_active !== null) {
      params.is_active = is_active;
    }

    const response: AxiosResponse<CategoryResponse> = await api.get(
      "/category",
      { params }
    );

    const categoriesFormatted = response.data.categories
      ? response.data.categories.map(formatCategoryDates)
      : [];

    return {
      message: response.data.message,
      categories: response.data.categories || [],
      categoriesFormatted,
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

/**
 * Get a specific category by ID
 */
const getCategory = async (
  id: string
): Promise<{
  message?: string;
  category?: CategoryType;
  categoryFormatted?: FormattedCategoryType;
}> => {
  try {
    const response: AxiosResponse<CategoryResponse> = await api.get(
      `/category/${id}`
    );

    // Format dates for the category
    const categoryFormatted = response.data.category
      ? formatCategoryDates(response.data.category)
      : undefined;

    return {
      message: response.data.message,
      category: response.data.category,
      categoryFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle not found error
      if (error.response?.status === 404) {
        throw new Error("Kategori tidak ditemukan");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal mengambil data kategori");
  }
};

/**
 * Update a category
 */
const updateCategory = async (
  id: string,
  data: Partial<CategoryRequest>
): Promise<{
  status: number;
  message?: string;
  category?: CategoryType;
  categoryFormatted?: FormattedCategoryType;
}> => {
  try {
    // Log the data being sent
    console.log("Updating category with data:", data);

    const response: AxiosResponse<CategoryResponse> = await api.put(
      `/category/${id}`,
      data
    );

    // Get status code
    const status = response.status;

    // Log the response
    console.log("Category update response:", response.data);

    // Format dates for the updated category
    const categoryFormatted = response.data.category
      ? formatCategoryDates(response.data.category)
      : undefined;

    return {
      status: status,
      message: response.data.message,
      category: response.data.category,
      categoryFormatted,
    };
  } catch (error) {
    console.error("Error updating category:", error);

    if (axios.isAxiosError(error)) {
      // Define common error messages
      const errorMessages = {
        422: "Kategori gagal diperbarui: Data tidak valid",
        403: "Anda tidak memiliki izin untuk memperbarui kategori",
        404: "Kategori tidak ditemukan",
        409: "Kategori dengan nama ini sudah ada",
        default: "Gagal memperbarui kategori",
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
        "Gagal memperbarui kategori: Terjadi kesalahan yang tidak diketahui",
    };
  }
};

/**
 * Delete a category
 */
const deleteCategory = async (
  id: string
): Promise<{
  status: number;
  message?: string;
}> => {
  try {
    const response: AxiosResponse<CategoryResponse> = await api.delete(
      `/category/${id}`
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

const restoreCategory = async (
  id: string
): Promise<{
  status: number;
  message?: string;
}> => {
  try {
    // Mengirim request untuk memulihkan kategori
    const response: AxiosResponse<CategoryResponse> = await api.post(
      `/category/${id}/restore`
    );

    return {
      status: response.status,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Define common error messages
      const errorMessages = {
        403: "Anda tidak memiliki izin untuk memulihkan kategori",
        404: "Kategori tidak ditemukan",
        422: "Kategori ini tidak dapat dipulihkan karena sudah memiliki data terkait",
        default: "Gagal memulihkan kategori",
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
        "Gagal memulihkan kategori: Terjadi kesalahan yang tidak diketahui",
    };
  }
};

const categoryService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
};

export default categoryService;
