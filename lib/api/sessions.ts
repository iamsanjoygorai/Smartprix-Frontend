export interface UserSession {
  id: string;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  startedAt: string;
  lastSeenAt: string | null;
  endedAt: string | null;
  isActive: boolean;
}

interface SessionsResponse {
  success: boolean;
  data: UserSession[];
}

export async function getMySessions(): Promise<UserSession[]> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("smartprix_token")
      : null;

  if (!token) {
    throw new Error("Authentication required");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const response = await fetch(
    `${baseUrl}/profile/sessions`,
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
    (await response.json()) as SessionsResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      "Failed to load sessions",
    );  
  }

  return result.data;
}