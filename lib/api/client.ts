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

  const timezone =
  typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : null;

if (timezone) {
  headers.set("X-Timezone", timezone);
}

console.log("CLIENT TIMEZONE:", timezone);
console.log(
  "CLIENT X-TIMEZONE HEADER:",
  headers.get("X-Timezone"),
);

  const url = `${API_URL}${endpoint}`;

  console.log("API Request:", {
    method: options.method ?? "GET",
    url,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    console.log("🔥 API FETCH FUNCTION RUNNING");
console.log("🔥 RAW RESPONSE:", response);

    const responseText = await response.text();
console.log("🔥 RESPONSE TEXT:", responseText.slice(0, 300));
    if (!response.ok) {
      console.error(
  "API REQUEST FAILED",
  "\nURL:", url,
  "\nMETHOD:", options.method ?? "GET",
  "\nSTATUS:", response.status,
  "\nSTATUS TEXT:", response.statusText,
  "\nRESPONSE:", responseText,
);

      let errorMessage = `API request failed: ${response.status}`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);

          errorMessage =
            errorData?.message ??
            errorData?.error ??
            errorData?.details ??
            errorMessage;
        } catch {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    if (!responseText) {
      return {} as T;
    }

    try {
      return JSON.parse(responseText) as T;
    } catch {
      console.error("API returned invalid JSON:", {
        url,
        status: response.status,
        response: responseText,
      });

      throw new Error("API returned an invalid JSON response");
    }
  } catch (error) {
    console.error("apiFetch error:", {
      url,
      method: options.method ?? "GET",
      error,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });

    throw error;
  }
}