import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'nodotech_token';
const PUBLIC_PATHS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const hasCookie = req.cookies.has(AUTH_COOKIE);

  if (!hasCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (hasCookie && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/campaign/:path*', '/login'],
};
