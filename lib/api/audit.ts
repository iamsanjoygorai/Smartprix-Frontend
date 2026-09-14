import { apiFetch } from "@/lib/api/client";


/* =========================================================
   AUDIT LOG
========================================================= */

export interface AuditLog {
  id: string;

  actorUserId: string | null;
  targetUserId: string | null;

  action: string;
  category: string;

  entityType: string | null;
  entityId: string | null;

  description: string | null;

  metadata: Record<string, unknown> | null;

  sessionId: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  country: string | null;
  state: string | null;
  city: string | null;
  timezone: string | null;

  createdAt: string;

  actor?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;

  session?: {
    id: string;
    deviceType: string | null;
    browser: string | null;
    operatingSystem: string | null;
    startedAt: string;
    lastSeenAt: string | null;
    endedAt: string | null;
    isActive: boolean;
  } | null;
}

/* =========================================================
   AUDIT PAGINATION
========================================================= */

export interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================================================
   AUDIT RESPONSE
========================================================= */

export interface AuditResponse {
  success: boolean;

  data: AuditLog[];

  pagination: AuditPagination;

  message?: string;
}

/* =========================================================
   AUDIT FILTERS
========================================================= */

export interface AuditFilters {
  page?: number;
  limit?: number;

  user?: string;
  action?: string;
  category?: string;

  ipAddress?: string;
  sessionId?: string;

  entityType?: string;
  entityId?: string;

  from?: string;
  to?: string;
}

/* =========================================================
   GET AUDIT LOGS
========================================================= */

export async function getAuditLogs(
  filters: AuditFilters = {},
): Promise<AuditResponse> {
  console.log("🔥🔥 NEW getAuditLogs FUNCTION RUNNING");

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return apiFetch<AuditResponse>(
    `/admin/audit${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}
/* =========================================================
   USER SESSION
========================================================= */

export interface UserSession {
  id: string;

  startedAt: string;
  lastSeenAt: string | null;
  endedAt: string | null;

  isActive: boolean;

  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  country: string | null;
  state: string | null;
  city: string | null;
  timezone: string | null;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string | null;
    email: string | null;
    mobile: string | null;
    role: string;

    isDisabled: boolean;
    isDeleted: boolean;

    profileImageUrl: string | null;
  } | null;
}

/* =========================================================
   SESSION PAGINATION
========================================================= */

export interface SessionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================================================
   SESSIONS RESPONSE
========================================================= */

export interface SessionsResponse {
  success: boolean;

  data: UserSession[];

  statistics: {
    total: number;
    active: number;
    ended: number;
  };

  filteredStatistics: {
    total: number;
    active: number;
    ended: number;
  };

  pagination: SessionPagination;

  message?: string;
}

/* =========================================================
   SESSION FILTERS
========================================================= */

export interface SessionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "ended" | "";
}

/* =========================================================
   GET ALL SESSIONS
========================================================= */

export async function getAllSessions(
  filters: SessionFilters = {},
): Promise<SessionsResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  const endpoint =
    `/admin/audit/sessions${query ? `?${query}` : ""}`;

  return apiFetch<SessionsResponse>(endpoint, {
    method: "GET",
  });
}

/* =========================================================
   GET SESSIONS FOR ONE USER
========================================================= */

export async function getUserSessions(
  userId: string,
): Promise<{
  success: boolean;
  data: UserSession[];
  message?: string;
}> {
  return apiFetch<{
    success: boolean;
    data: UserSession[];
    message?: string;
  }>(
    `/admin/audit/sessions/${encodeURIComponent(userId)}`,
    {
      method: "GET",
    },
  );
}

/* =========================================================
   SEARCH HISTORY USER
========================================================= */

export interface SearchHistoryUser {
  id: string;

  name: string | null;
  email: string | null;
  mobile: string | null;

  role: string;

  isDisabled: boolean;
  isDeleted: boolean;

  profileImageUrl: string | null;
}

/* =========================================================
   SEARCH HISTORY SESSION
========================================================= */

export interface SearchHistorySession {
  id: string;

  startedAt: string;
  lastSeenAt: string | null;
  endedAt: string | null;

  isActive: boolean;

  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
}

/* =========================================================
   SEARCH HISTORY ITEM
========================================================= */

export interface SearchHistoryItem {
  id: string;

  query: string;
  normalized: string;

  filters: Record<string, unknown> | null;

  ipAddress: string | null;
  userAgent: string | null;

  country: string | null;
  state: string | null;
  city: string | null;
  timezone: string | null;

  createdAt: string;

  user: SearchHistoryUser | null;

  session: SearchHistorySession | null;
}

/* =========================================================
   SEARCH HISTORY PAGINATION
========================================================= */

export interface SearchHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================================================
   SEARCH HISTORY RESPONSE
========================================================= */

export interface SearchHistoryResponse {
  success: boolean;

  data: SearchHistoryItem[];

  pagination: SearchHistoryPagination;

  message?: string;
}

/* =========================================================
   SEARCH HISTORY FILTERS
========================================================= */

export interface SearchHistoryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

/* =========================================================
   GET ALL SEARCH HISTORY
========================================================= */

export async function getAllSearchHistory(
  filters: SearchHistoryFilters = {},
): Promise<SearchHistoryResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return apiFetch<SearchHistoryResponse>(
    `/admin/audit/search${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}

/* =========================================================
   GET SEARCH HISTORY FOR ONE USER
========================================================= */

export async function getUserSearchHistory(
  userId: string,
): Promise<SearchHistoryResponse> {
  return apiFetch<SearchHistoryResponse>(
    `/admin/audit/search/${encodeURIComponent(userId)}`,
    {
      method: "GET",
    },
  );
}
