import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { LOGIN_ROUTE, ROLE_ROUTES } from './constants/roles';
import { UserRole } from './types/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Reading from a cookie (not from sessionStorage)
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value as
    UserRole | undefined;

  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedPage =
    pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

  // Protecting pages
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If a logged-in user navigates to the login page
  if (isAuthPage && token && userRole) {
    const redirectPath = ROLE_ROUTES[userRole] || '/';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If a logged-in user navigates to a page they do not have access to
  if (isProtectedPage && token && userRole) {
    // Checking access to the admin page
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // Checking access to the club page
    if (pathname.startsWith('/dashboard/seller') && userRole === 'athlete') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // Configuring headers for API requests
  const response = NextResponse.next();

  // If the token exists, add it to the request headers
  if (token) {
    response.headers.set('Authorization', `Bearer ${token}`);
  }

  return response;
}

// Configuring execution paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/settings/:path*',
    '/api/:path*', // It's also useful for APIs
  ],
};
