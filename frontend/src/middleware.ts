import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'nodotech_token';
const PUBLIC_PATHS = ['/login'];
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: `${AUTH_COOKIE}=${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const valid = await hasValidSession(req);

  if (!valid && !isPublic) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
  if (valid && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/campaign/:path*', '/login'],
};
