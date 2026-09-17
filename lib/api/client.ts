const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("smartprix_token")
      : null;

  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof window !== "undefined") {
    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone) {
      headers.set("X-Timezone", timezone);
    }
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const responseText = await response.text();

    // HTTP errors
    if (!response.ok) {
      let message =
        `Request failed with status ${response.status}.`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);

          message =
            errorData?.message ??
            errorData?.error ??
            errorData?.details ??
            message;
        } catch {
          // Keep default message.
        }
      }

      return {
        success: false,
        message,
        error: "API_REQUEST_FAILED",
        status: response.status,
      } as T;
    }

    // Empty successful response
    if (!responseText) {
      return {} as T;
    }

    // JSON response
    try {
      return JSON.parse(responseText) as T;
    } catch {
      return {
        success: false,
        message: "The server returned an invalid response.",
        error: "INVALID_JSON_RESPONSE",
        status: response.status,
      } as T;
    }
  } catch {
    // Backend unavailable / network failure
    return {
      success: false,
      message: "Unable to connect to the server.",
      error: "SERVER_UNAVAILABLE",
      status: 0,
    } as T;
  }
}