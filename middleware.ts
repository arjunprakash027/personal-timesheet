// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  // Define public paths that don't require authentication.
  const publicPaths = ['/login', '/api/login', '/_next/', '/favicon.ico'];
  const { pathname } = request.nextUrl;
  
  // If the request is for a public path, let it pass.
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check for the session cookie. In our setup, iron-session stores the session in a cookie
  const sessionCookie = request.cookies.get('timesheet-session');
  
  // If no session cookie exists, redirect the user to the login page.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Optionally, you can decode or verify the cookie further if needed.
  
  // If a valid session exists, allow the request to proceed.
  return NextResponse.next();
}

// Tell Next.js which paths to run this middleware on.
export const config = {
  matcher: '/((?!_next|favicon.ico|api).*)',
};
