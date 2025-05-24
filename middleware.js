import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// middleware function runs on every request matching the config.matcher paths
export async function middleware(request) {
  // debugging logs
  // console.log('Middleware triggered for:', request.url);
  // console.log('Request method:', request.method);
  // console.log('Request headers:', Object.fromEntries(request.headers.entries()));

  const response = NextResponse.next();

  // set CORS headers for the response
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // get the JWT token from the request cookies
  const token = await getToken({ req: request });
  // extract pathname from the request URL
  const pathname = request.nextUrl.pathname;

  // console.log('Middleware token:', token);
  // console.log('Pathname:', pathname);

  // public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/error', '/signup', '/', '/api/mobile-login'];
  if (publicRoutes.includes(pathname)) {
    return response;
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
  return response;
}

// define which routes this middleware applies to
export const config = {
  // all protected routes that require authentication
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
  ],
};