import { type NextRequest, NextResponse } from "next/server";

import { createMiddlewareClient } from "@/lib/db/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/auth/callback", "/design", "/api/auth"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
