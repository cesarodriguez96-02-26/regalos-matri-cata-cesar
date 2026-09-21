import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, adminCookieOptions } from '@/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', { ...adminCookieOptions, maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
