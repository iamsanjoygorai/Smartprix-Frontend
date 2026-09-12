export interface AdminSessionUser {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  isDisabled: boolean;
  isDeleted: boolean;
}

export interface AdminSession {
  id: string;
  userId: string;
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

  user: AdminSessionUser;
}

export interface AdminSessionsResponse {
  success: boolean;
  data: AdminSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export async function getAllUserSessions(
  page = 1,
  limit = 50,
): Promise<AdminSessionsResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "smartprix_token",
        )
      : null;

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const response = await fetch(
    `${baseUrl}/admin/audit/sessions?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as AdminSessionsResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load user sessions",
    );
  }

  return result;
}