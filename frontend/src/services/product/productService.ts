import { FormattedProductType, ProductType } from "@/utils/types/ProductType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";
import formattedDate from "@/utils/formattedDate";

interface ProductResponse {
  message?: string;
  products?: ProductType[]; // Array of products (for index endpoint)
  product?: ProductType; // Single product (for show/update endpoints)
  error?: string;
  status?: number;
}

const formatProductDates = (product: ProductType): FormattedProductType => {
  return {
    ...product,
    created_at_formatted: formattedDate(new Date(product.created_at)),
    updated_at_formatted: formattedDate(new Date(product.updated_at)),
    deleted_at_formatted: product.deleted_at
      ? formattedDate(new Date(product.deleted_at))
      : undefined,
  };
};

const getProducts = async ({
  is_featured = null,
}: {
  is_featured?: boolean | null;
} = {}): Promise<{
  message?: string;
  products: ProductType[];
  productsFormatted: FormattedProductType[];
}> => {
  try {
    const params: Record<string, any> = {};

    if (is_featured !== null) {
      params.is_featured = is_featured;
    }

    const response: AxiosResponse<ProductResponse> = await api.get("/product", {
      params,
    });

    const productsFormatted = response.data.products
      ? response.data.products.map(formatProductDates)
      : [];

    return {
      message: response.data.message,
      products: response.data.products || [],
      productsFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Gagal mengambil data produk");
  }
};

const getProduct = async (
  id: string
): Promise<{
  message?: string;
  product?: ProductType;
  productFormatted?: FormattedProductType;
}> => {
  try {
    const response: AxiosResponse<ProductResponse> = await api.get(
      `/product/${id}`
    );

    const product = response.data.product;
    if (product) {
      const productFormatted = formatProductDates(product);
      return {
        message: response.data.message,
        product,
        productFormatted,
      };
    }
    return {
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg =
        error.response?.data?.message || "Gagal mengambil data produk";
      throw new Error(msg);
    }
    throw new Error("Gagal mengambil data produk");
  }
};

const createProduct = async (
  data: FormData
): Promise<{
  error?: string;
  status: number;
  message?: string;
  products?: ProductType[];
  productsFormatted?: FormattedProductType[];
}> => {
  try {
    console.log("FormData content:");
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
    const response: AxiosResponse<ProductResponse> = await api.post(
      "/product",
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
    const productsFormatted = response.data.products
      ? response.data.products.map(formatProductDates)
      : [];

    return {
      error: response.data.error,
      status: status,
      message: response.data.message,
      products: response.data.products,
      productsFormatted,
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

/**
 * Update an existing product
 */
const updateProduct = async (
  id: string,
  data: FormData
): Promise<{
  status: number;
  message?: string;
  product?: ProductType;
  productFormatted?: FormattedProductType;
}> => {
  try {
    console.log("FormData content:");
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
    const response: AxiosResponse<ProductResponse> = await api.post(
      `/product/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Get status from response
    const status = response.status;

    // Format dates for the updated product
    const productFormatted = response.data.product
      ? formatProductDates(response.data.product)
      : undefined;

    return {
      status: status,
      message: response.data.message,
      product: response.data.product,
      productFormatted,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle validation errors
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message ||
            "Produk gagal diperbarui: Data tidak valid"
        );
      }
      // Handle unauthorized errors
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki izin untuk memperbarui produk");
      }
      // Handle not found error
      if (error.response?.status === 404) {
        throw new Error("Produk tidak ditemukan");
      }
      // Handle other error responses with messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.request && !error.response) {
        throw new Error("Tidak dapat terhubung ke server");
      }
      // Default error
      throw new Error(
        "Gagal memperbarui produk: Terjadi kesalahan pada server"
      );
    }
    // If error is not from axios
    throw new Error(
      "Gagal memperbarui produk: Terjadi kesalahan yang tidak diketahui"
    );
  }
};

// Function to handle create response in components
export const handleCreateResponse = (response: {
  error?: string;
  status: number;
  message?: string;
  products?: ProductType[];
  productsFormatted?: FormattedProductType[];
}) => {
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.status === 201) {
    // Show success notification
    return {
      success: true,
      message: response.message || "Produk berhasil dibuat",
      products: response.products,
      productsFormatted: response.productsFormatted,
    };
  } else {
    throw new Error(`Unexpected status code: ${response.status}`);
  }
};

const deleteProduct = async (id: string): Promise<{ message?: string }> => {
  try {
    const response: AxiosResponse<ProductResponse> = await api.delete(
      `/product/${id}`
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
      // Handle validation error (product has related products)
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

const importProduct = async (
  data: FormData
): Promise<{
  error?: string;
  status: number;
  message?: string;
  products?: ProductType[];
  productsFormatted?: FormattedProductType[];
}> => {
  try {
    console.log("FormData content:");
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
    const response: AxiosResponse<ProductResponse> = await api.post(
      "/import/product",
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
    const productsFormatted = response.data.products
      ? response.data.products.map(formatProductDates)
      : [];

    return {
      error: response.data.error,
      status: status,
      message: response.data.message,
      products: response.data.products,
      productsFormatted,
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

const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  importProduct,
};

export default productService;
