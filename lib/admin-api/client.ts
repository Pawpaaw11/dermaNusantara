import type {
  ApiErrorPayload,
  ApiResponse,
  ListParams,
} from "./types";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = "UNKNOWN_ERROR",
    public details?: unknown,
    public requestId?: string,
  ) {
    super(message);
  }
}

let refreshPromise: Promise<void> | null = null;

async function errorFromResponse(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  return new AdminApiError(
    payload?.error?.message ?? fallback,
    response.status,
    payload?.error?.code,
    payload?.error?.details,
    payload?.error?.requestId,
  );
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/admin/auth/refresh", {
      method: "POST",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw await errorFromResponse(response, "Sesi berakhir, silakan masuk kembali.");
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function fetchWithSession(path: string, init: RequestInit = {}) {
  const normalizedPath = path.replace(/^\/+/, "");
  const request = () => fetch(`/api/admin/${normalizedPath}`, {
    ...init,
    cache: "no-store",
  });
  let response = await request();
  const canRefresh = !["auth/login", "auth/refresh"].includes(normalizedPath);
  if (response.status === 401 && canRefresh) {
    await refreshSession();
    response = await request();
  }
  return response;
}

export function queryString(params: ListParams = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function adminRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetchWithSession(path, {
    ...init,
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw await errorFromResponse(response, "Permintaan admin gagal.");
  }
  return response.json() as Promise<ApiResponse<T>>;
}

export async function adminDownload(path: string) {
  const response = await fetchWithSession(path);
  if (!response.ok) {
    throw await errorFromResponse(response, "Export gagal.");
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename =
    /filename="?([^"]+)"?/i.exec(disposition)?.[1] ?? "laporan";
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}
