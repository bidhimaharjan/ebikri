import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = await getToken({ req: request });

  // redirect to login if user is not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// protect specific routes
export const config = {
  matcher: [ '/dashboard', '/inventory', '/orders', '/customers' ],
};