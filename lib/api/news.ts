import { apiFetch } from "./client";

import type { ApiResponse } from "@/types/api";
import type { NewsItem } from "@/types/news";

export async function getTrendingNews(): Promise<ApiResponse<NewsItem[]>> {
  return apiFetch<ApiResponse<NewsItem[]>>("/news/trending");
}
