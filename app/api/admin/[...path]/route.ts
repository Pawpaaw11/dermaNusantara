import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl =
  process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function cookieHeaderWith(setCookies: string[], current: string) {
  const values = new Map<string, string>();
  for (const item of current.split(";")) {
    const [key, ...rest] = item.trim().split("=");
    if (key) values.set(key, rest.join("="));
  }
  for (const item of setCookies) {
    const [pair] = item.split(";");
    const [key, ...rest] = pair.split("=");
    if (key) values.set(key, rest.join("="));
  }
  return [...values].map(([key, value]) => `${key}=${value}`).join("; ");
}

function getSetCookies(headers: Headers) {
  return typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : headers.get("set-cookie")
      ? [headers.get("set-cookie")!]
      : [];
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = `${apiBaseUrl}/admin/${path.join("/")}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const originalCookie = request.headers.get("cookie") ?? "";

  const forward = async (cookie: string, csrf?: string) => {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    if (cookie) headers.set("cookie", cookie);
    if (mutationMethods.has(request.method)) {
      const csrfValue =
        csrf ??
        /(?:^|;\s*)admin_csrf=([^;]+)/.exec(cookie)?.[1] ??
        request.cookies.get("admin_csrf")?.value;
      if (csrfValue) headers.set("x-csrf-token", decodeURIComponent(csrfValue));
    }
    return fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  };

  try {
    let response = await forward(originalCookie);
    let cookiesToForward = getSetCookies(response.headers);
    const isRefreshEndpoint =
      path[0] === "auth" && ["login", "refresh"].includes(path[1] ?? "");

    if (
      response.status === 401 &&
      !isRefreshEndpoint &&
      request.cookies.has("admin_refresh")
    ) {
      const refresh = await fetch(`${apiBaseUrl}/admin/auth/refresh`, {
        method: "POST",
        headers: { cookie: originalCookie },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      const refreshedCookies = getSetCookies(refresh.headers);
      cookiesToForward = refreshedCookies;
      if (refresh.ok) {
        const retryCookie = cookieHeaderWith(refreshedCookies, originalCookie);
        response = await forward(retryCookie);
        cookiesToForward = [
          ...refreshedCookies,
          ...getSetCookies(response.headers),
        ];
      } else {
        cookiesToForward = [
          ...refreshedCookies,
          "admin_access=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
          "admin_refresh=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
          "admin_csrf=; Path=/; Max-Age=0; SameSite=Lax",
        ];
      }
    }

    const headers = new Headers();
    for (const name of ["content-type", "content-disposition", "retry-after"]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    for (const cookie of cookiesToForward) headers.append("set-cookie", cookie);
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "ADMIN_API_UNAVAILABLE",
          message: "Layanan admin belum dapat dihubungi.",
        },
      },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
