import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export async function getCategories(): Promise<
  ApiResponse<AdminCategory[]>
> {
  return apiFetch<ApiResponse<AdminCategory[]>>(
    "/categories",
  );
}