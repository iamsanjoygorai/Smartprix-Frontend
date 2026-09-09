import { apiFetch } from "./client";

import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

export interface CreateProductInput {
  name: string;
  description?: string;
  brandSlug: string;
  categorySlug: string;
  images?: string[];
  price: number;
  sellerSlug?: string;
  specifications?: Record<string, string>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  brandSlug?: string;
  categorySlug?: string;
  images?: string[];
  price?: number;
  sellerSlug?: string;
  specifications?: Record<string, string>;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(
    "/admin/products",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(
    `/admin/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteProduct(
  id: string,
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(
    `/admin/products/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreProduct(
  id: string,
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(
    `/admin/products/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function getAdminProducts(): Promise<
  ApiResponse<Product[]>
> {
  return apiFetch<ApiResponse<Product[]>>(
    "/admin/products",
  );
}