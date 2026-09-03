import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface AdminStats {
  products: number;
  categories: number;
  brands: number;
  sellers: number;
  users: number;
}

export async function getAdminStats(): Promise<
  ApiResponse<AdminStats>
> {
  const [
    productsResponse,
    categoriesResponse,
    brandsResponse,
    sellersResponse,
  ] = await Promise.all([
    apiFetch<ApiResponse<unknown[]>>("/products"),
    apiFetch<ApiResponse<unknown[]>>("/categories"),
    apiFetch<ApiResponse<unknown[]>>("/brands"),
    apiFetch<ApiResponse<unknown[]>>("/sellers"),
  ]);

  return {
    success: true,
    data: {
      products: productsResponse.data.length,
      categories: categoriesResponse.data.length,
      brands: brandsResponse.data.length,
      sellers: sellersResponse.data.length,
      users: 0,
    },
  };
}