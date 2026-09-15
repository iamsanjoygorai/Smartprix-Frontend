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


/* =========================================================
   GIT-LIKE HISTORY TYPES
========================================================= */

export interface HistoryVersionResponse {
  version: number;
  snapshot: Record<string, unknown> | null;
  event: {
    id: string;
    eventType: string;
    title: string;
    description: string | null;
    createdAt: string;
  } | null;
}

export interface HistoryLatestVersionResponse {
  entityType: string;
  entityId: string;
  version: number;
}

export interface HistoryDiffResponse {
  entityType: string;
  entityId: string;
  fromVersion: number;
  toVersion: number;
  changes: Record<
    string,
    HistoryChange
  >;
}

/* =========================================================
   GET ENTITY HISTORY
========================================================= */

export async function getEntityHistory(
  entityType: string,
  entityId: string,
  params: {
    page?: number;
    limit?: number;
    category?: string;
    eventType?: string;
    operation?: string;
  } = {},
): Promise<HistoryTimelineResponse> {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          String(value),
        );
      }
    },
  );

  const query =
    searchParams.toString();

  const response =
    await apiFetch<{
      success: boolean;
      data: HistoryTimelineResponse;
      message?: string;
    }>(
      `/admin/history/entity/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(
        entityId,
      )}${query ? `?${query}` : ""}`,
    );

  return response.data;
}

/* =========================================================
   GET EVENT DETAILS
========================================================= */

export async function getHistoryEvent(
  eventId: string,
): Promise<HistoryEvent> {
  const response =
    await apiFetch<{
      success: boolean;
      data: HistoryEvent;
      message?: string;
    }>(
      `/admin/history/event/${encodeURIComponent(
        eventId,
      )}`,
    );

  return response.data;
}

/* =========================================================
   GET VERSION
========================================================= */

export async function getHistoryVersion(
  entityType: string,
  entityId: string,
  version: number,
): Promise<HistoryVersionResponse> {
  const response =
    await apiFetch<{
      success: boolean;
      data: HistoryVersionResponse;
      message?: string;
    }>(
      `/admin/history/version/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(
        entityId,
      )}/${version}`,
    );

  return response.data;
}

/* =========================================================
   GET LATEST VERSION
========================================================= */

export async function getLatestHistoryVersion(
  entityType: string,
  entityId: string,
): Promise<HistoryLatestVersionResponse> {
  const response =
    await apiFetch<{
      success: boolean;
      data: HistoryLatestVersionResponse;
      message?: string;
    }>(
      `/admin/history/latest/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(
        entityId,
      )}`,
    );

  return response.data;
}

/* =========================================================
   COMPARE TWO VERSIONS
========================================================= */

export async function getHistoryDiff(
  entityType: string,
  entityId: string,
  fromVersion: number,
  toVersion: number,
): Promise<HistoryDiffResponse> {
  const searchParams =
    new URLSearchParams({
      fromVersion: String(
        fromVersion,
      ),
      toVersion: String(
        toVersion,
      ),
    });

  const response =
    await apiFetch<{
      success: boolean;
      data: HistoryDiffResponse;
      message?: string;
    }>(
      `/admin/history/diff/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(
        entityId,
      )}?${searchParams.toString()}`,
    );

  return response.data;
}