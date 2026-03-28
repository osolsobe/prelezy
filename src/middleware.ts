import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware(routing);

const protectedPatterns = ["/profile", "/admin"];

function isProtected(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(cs|en)/, "");
  return protectedPatterns.some((p) => withoutLocale.startsWith(p));
}

function isAdminOnly(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(cs|en)/, "");
  return withoutLocale.startsWith("/admin");
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API routes pass through
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply i18n middleware
  const intlResponse = intlMiddleware(request);

  if (isProtected(pathname)) {
    const session = await auth();

    if (!session) {
      const locale = pathname.startsWith("/en") ? "en" : "cs";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminOnly(pathname) && (session.user as { role?: string })?.role !== "ADMIN") {
      const locale = pathname.startsWith("/en") ? "en" : "cs";
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)",],
};
