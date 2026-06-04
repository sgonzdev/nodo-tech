import { CookieOptions } from 'express';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}
