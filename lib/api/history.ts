import { apiFetch } from "./client";

export interface HistoryChange {
  before: unknown;
  after: unknown;
}

export interface HistoryEvent {
  id: string;
  actorUserId: string | null;
  targetUserId: string | null;

  category: string;
  eventType: string;
  operation: string | null;

  entityType: string | null;
  entityId: string | null;

  title: string;
  description: string | null;

  version: number | null;

  changes: Record<string, HistoryChange> | null;
  metadata: Record<string, unknown> | null;

  sessionId: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  country: string | null;
  state: string | null;
  city: string | null;
  timezone: string | null;

  parentEventId: string | null;

  createdAt: string;

  actor?: {
    id: string;
    name: string | null;
    email: string | null;
    profileImageUrl: string | null;
    role: string;
  } | null;

  target?: {
    id: string;
    name: string | null;
    email: string | null;
    profileImageUrl: string | null;
    role: string;
  } | null;
}

export interface HistoryTimelineResponse {
  events: HistoryEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HistoryTimelineParams {
  page?: number;
  limit?: number;

  entityType?: string;
  entityId?: string;

  actorUserId?: string;
  targetUserId?: string;

  category?: string;
  eventType?: string;
  operation?: string;
  search?: string;

  from?: string;
  to?: string;
}

export async function getHistoryTimeline(
  params: HistoryTimelineParams = {},
): Promise<HistoryTimelineResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(key, String(value));
      }
    },
  );

  const query = searchParams.toString();

  const response = await apiFetch<{
    success: boolean;
    data: HistoryTimelineResponse;
    message?: string;
  }>(
    `/admin/history${query ? `?${query}` : ""}`,
  );

  return response.data;
}