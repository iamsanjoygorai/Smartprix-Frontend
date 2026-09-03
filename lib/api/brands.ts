import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export async function getBrands(): Promise<
  ApiResponse<AdminBrand[]>
> {
  return apiFetch<ApiResponse<AdminBrand[]>>("/brands");
}