import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ROUTES } from './constants/routes';
import { LOGIN_ROUTE, ROLE_ROUTES } from './constants/roles';
import { UserRole } from './types/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value as UserRole | undefined;

  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

  // Protecting pages
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url)); 
  }

  // If a logged-in user navigates to the login page
  if (isAuthPage && token && userRole) {
    const redirectPath = ROLE_ROUTES[userRole] || ROUTES.HOME; 
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If a logged-in user navigates to a page they do not have access to
  if (isProtectedPage && token && userRole) {
    // Checking access to the admin page
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL(ROUTES.FORBIDDEN, request.url));
    }

    // Checking access to the seller page
    if (pathname.startsWith('/dashboard/seller') && userRole === 'athlete') {
      return NextResponse.redirect(new URL(ROUTES.FORBIDDEN, request.url)); 
    }
  }

  const response = NextResponse.next();

  if (token) {
    response.headers.set('Authorization', `Bearer ${token}`);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/settings/:path*',
    '/api/:path*',
  ],
};