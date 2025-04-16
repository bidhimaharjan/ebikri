import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/login', '/auth/error'];
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // Block all API routes except NextAuth
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (token.requiresProfileCompletion) {
      return new NextResponse(
        JSON.stringify({ error: 'Complete your profile first' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle profile completion
  if (token.requiresProfileCompletion) {
    if (!pathname.startsWith('/auth/complete-profile')) {
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
    }
  } else if (pathname.startsWith('/auth/complete-profile')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except:
    // - NextAuth.js specific routes
    // - Static assets
    // - Error pages
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth/error|login).*)',
  ],
};
