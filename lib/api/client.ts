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

if (!isFormData) {
headers.set("Content-Type", "application/json");
}

if (token) {
headers.set("Authorization", `Bearer ${token}`);
}

const url = `${API_URL}${endpoint}`;

try {
const response = await fetch(url, {
...options,
headers,
});


if (!response.ok) {
  const responseText = await response.text();

  console.error("API Request Failed:", {
    url,
    status: response.status,
    statusText: response.statusText,
    response: responseText,
  });

  let errorMessage = `API request failed: ${response.status}`;

  if (responseText) {
    try {
      const errorData = JSON.parse(responseText);

      errorMessage =
        errorData?.message ??
        errorData?.error ??
        errorMessage;
    } catch {
      errorMessage = responseText;
    }
  }

  throw new Error(errorMessage);
}

return (await response.json()) as T;


} catch (error) {
console.error("apiFetch error:", error);


throw error;


}
}
