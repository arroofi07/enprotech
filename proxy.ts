import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  canAccessRoute,
  getDashboardPath,
  isPublicPath,
} from "@/lib/domain/auth/permissions";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/infrastructure/auth/session-manager";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/health") || pathname.startsWith("/api/verify/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isPublicPath(pathname)) {
    if (session) {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url),
      );
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessRoute(session.role, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
