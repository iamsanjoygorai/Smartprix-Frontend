import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface AdminSeller {
  id: string;
  name: string;
  slug: string;
}

export async function getSellers(): Promise<
  ApiResponse<AdminSeller[]>
> {
  return apiFetch<ApiResponse<AdminSeller[]>>(
    "/sellers",
  );
}