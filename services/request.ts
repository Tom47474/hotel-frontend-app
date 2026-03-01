import { getApiBaseUrl } from "@/utils/api";

export class RequestError extends Error {
  constructor(
    message: string,
    public code?: number,
    public status?: number
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new RequestError(
      json.message || res.statusText,
      json.code,
      res.status
    );
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
