import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface ProductSpecification {
  id: string;
  key: string;
  value: {
    id: string;
    specificationId: string;
    value: string;
    createdAt: string;
  } | null;
}

export async function getProductSpecifications(
  slug: string,
): Promise<ApiResponse<ProductSpecification[]>> {
  return apiFetch<ApiResponse<ProductSpecification[]>>(
    `/products/${slug}/specifications`,
  );
}