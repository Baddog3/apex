import { type NextRequest, NextResponse } from "next/server";

import { createMiddlewareClient } from "@/lib/db/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/auth/callback", "/design", "/api/auth"];
const ONBOARDING_ROUTE = "/onboarding";

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
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

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingCompleted = profile?.onboarding_completed ?? false;

    if (pathname === "/login" || pathname === "/") {
      const target = onboardingCompleted ? "/today" : ONBOARDING_ROUTE;
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (
      !onboardingCompleted &&
      pathname !== ONBOARDING_ROUTE &&
      !isApiRoute(pathname)
    ) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
    }

    if (onboardingCompleted && pathname === ONBOARDING_ROUTE) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
