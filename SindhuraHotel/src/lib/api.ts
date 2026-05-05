const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "http://localhost:3001"
    : "";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

const parseResponseBody = (rawBody: string): JsonValue => {
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as JsonValue;
  } catch {
    return { message: rawBody };
  }
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getAuthToken = () => localStorage.getItem("token");
export const getUserRole = () => localStorage.getItem("role");

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = false
): Promise<T> => {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (requiresAuth) {
    const token = getAuthToken();

    if (!token) {
      throw new ApiError("Please login first", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const rawBody = await response.text();
  const data = parseResponseBody(rawBody);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return data as T;
};
