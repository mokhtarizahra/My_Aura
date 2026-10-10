import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { locales, defaultLocale } from "./i18n/request";
import { ROLE_ROUTES } from "./constants/roles";
import { ROUTES } from "./constants/routes";
import { UserRole } from "./types/auth";

/*
|--------------------------------------------------------------------------
| next-intl middleware
|--------------------------------------------------------------------------
|
| Handles locale detection from the URL and rewrites the request
| so that the app renders the correct language.
|
*/
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // همیشه /fa یا /en در URL
});

/*
|--------------------------------------------------------------------------
| Auth middleware
|--------------------------------------------------------------------------
|
| Runs AFTER i18n has normalized the path.
| Reads cookies and decides whether the user can access the page.
|
*/
function handleAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Strip the locale prefix to get the "real" path.
  // e.g. /fa/dashboard -> /dashboard
  const pathnameWithoutLocale = pathname.replace(
    new RegExp(`^/(${locales.join("|")})`),
    "",
  ) || "/";

  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "1";
  const userRole = request.cookies.get("userRole")?.value as
    | UserRole
    | undefined;

  const isAuthPage = pathnameWithoutLocale.startsWith("/auth");
  const isProtectedPage =
    pathnameWithoutLocale.startsWith("/dashboard") ||
    pathnameWithoutLocale.startsWith("/settings");

  // 1. Protected page + not logged in -> redirect to login
  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  // 2. Auth page + already logged in -> redirect to role home
  if (isAuthPage && isLoggedIn && userRole) {
    const redirectPath = ROLE_ROUTES[userRole] || ROUTES.HOME;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 3. Role-based access control
  if (isProtectedPage && isLoggedIn && userRole) {
    if (
      pathnameWithoutLocale.startsWith("/dashboard/admin") &&
      userRole !== "super_admin"
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.FORBIDDEN, request.url),
      );
    }

    if (
      pathnameWithoutLocale.startsWith("/dashboard/seller") &&
      userRole === "athlete"
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.FORBIDDEN, request.url),
      );
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Main middleware
|--------------------------------------------------------------------------
|
| Pipeline:
| 1. Run i18n middleware first (handles locale in URL).
| 2. Run auth middleware second (protects routes).
|
*/
export async function middleware(request: NextRequest) {
  // Step 1: i18n
  const intlResponse = intlMiddleware(request);

  // If i18n decided to redirect (e.g. missing locale prefix),
  // respect that and return immediately.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Step 2: auth
  const authResponse = handleAuth(request);
  if (authResponse) {
    return authResponse;
  }

  // Step 3: return the i18n response (has the correct locale headers)
  return intlResponse;
}

export const config = {
  // Match all paths EXCEPT:
  // - API routes
  // - Next.js internals (_next, _vercel)
  // - static files (anything with a dot)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};