import type { ApiErrorShape } from "@nivora/shared";

const API_BASE = "/api/v1";

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(public readonly shape: ApiErrorShape) {
    super(shape.message);
  }
}

/**
 * Fetch wrapper: attaches the in-memory access token, sends the refresh
 * cookie, and retries once after a silent /auth/refresh on a 401 — mirrors
 * the token lifecycle in ARCHITECTURE.md § Security checklist.
 */
async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      const { accessToken: next } = await refreshed.json();
      setAccessToken(next);
      return request<T>(path, init, true);
    }
  }

  if (!res.ok) {
    const shape = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new ApiError(
      shape ?? { statusCode: res.status, code: "UNKNOWN_ERROR", message: res.statusText },
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
