import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface PriceHistoryItem {
  id: string;
  productId: string;
  variantId: string;
  sellerId: string;
  amount: string | number;
  recordedAt: string;
}

interface PriceHistoryData {
  history: PriceHistoryItem[];
}

export async function getProductPriceHistory(
  slug: string,
): Promise<ApiResponse<PriceHistoryData>> {
  return apiFetch<ApiResponse<PriceHistoryData>>(
    `/products/${slug}/price-history`,
  );
}