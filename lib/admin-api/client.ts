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
  const response = await fetch(`/api/admin/${path.replace(/^\/+/, "")}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | ApiErrorPayload
      | null;
    throw new AdminApiError(
      payload?.error?.message ?? "Permintaan admin gagal.",
      response.status,
      payload?.error?.code,
      payload?.error?.details,
      payload?.error?.requestId,
    );
  }
  return response.json() as Promise<ApiResponse<T>>;
}

export async function adminDownload(path: string) {
  const response = await fetch(`/api/admin/${path.replace(/^\/+/, "")}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | ApiErrorPayload
      | null;
    throw new AdminApiError(
      payload?.error?.message ?? "Export gagal.",
      response.status,
      payload?.error?.code,
    );
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
