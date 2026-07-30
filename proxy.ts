import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const hasSession =
    request.cookies.has("admin_access") ||
    request.cookies.has("admin_refresh");

  if (!isLogin && !hasSession) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }
  if (isLogin && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
