import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  // get the JWT token from the request cookies
  const token = await getToken({ req: request });
  // extract pathname from the request URL
  const pathname = request.nextUrl.pathname;

  // console.log('Middleware token:', token);
  // console.log('Pathname:', pathname);

  // public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/error', '/signup', '/'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // handle profile completion
  if (token.requiresProfileCompletion && !pathname.startsWith("/auth/complete-profile")) {
    return NextResponse.redirect(new URL("/auth/complete-profile", request.url));
  }

  // prevent access to complete-profile if already completed
  if (!token.requiresProfileCompletion && pathname.startsWith("/auth/complete-profile")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // if all checks pass, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // all protected routes that require authentication:
  matcher: [
    '/dashboard',
    '/auth/complete-profile',
    '/inventory',
    '/orders',
    '/customers',
    '/sales',
    '/marketing',
    '/settings',
    '/profile',
    '/api/:path*',
  ],
};