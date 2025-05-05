import formattedDate from "@/utils/formattedDate";
import { FormattedProductType, ProductType } from "@/utils/types/ProductType";
import axios, { AxiosResponse } from "axios";
import api from "../axios";

interface ProductResponse {
  message?: string;
  products: {
    current_page: number;
    data: ProductType[];
    total: number;
    per_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  error?: string;
  status?: number;
}

const formatProductDates = (product: ProductType): FormattedProductType => ({
  ...product,
  created_at_formatted: formattedDate(new Date(product.created_at)),
  updated_at_formatted: formattedDate(new Date(product.updated_at)),
  deleted_at_formatted: product.deleted_at
    ? formattedDate(new Date(product.deleted_at))
    : undefined,
});

const getProductsUser = async ({
  page = 1,
  per_page = 9,
  search = "",
  categoryId = "",
}: {
  page?: number;
  per_page?: number;
  search?: string;
  categoryId?: string;
} = {}): Promise<{
  message?: string;
  pagination: Omit<ProductResponse["products"], "data">;
  products: ProductType[];
  productsFormatted: FormattedProductType[];
}> => {
  try {
    const response: AxiosResponse<ProductResponse> = await api.get(
      "/user-product",
      {
        params: {
          page,
          per_page,
          search,
          categoryId,
        },
      }
    );

    const products = response.data.products?.data || [];
    const productsFormatted = products.map(formatProductDates);

    const {
      current_page,
      total,
      per_page: perPage,
      last_page,
      next_page_url,
      prev_page_url,
    } = response.data.products;

    return {
      message: response.data.message,
      products,
      productsFormatted,
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
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Gagal mengambil data produk");
  }
};

const productUserService = {
  getProductsUser,
};

export default productUserService;
