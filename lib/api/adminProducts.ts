import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

export interface UpdateProductInput {
  name?: string;
  description?: string;
  brandSlug?: string;
  categorySlug?: string;
  image?: string;
  price?: number;
  sellerSlug?: string;
  specifications?: Record<string, string>;
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