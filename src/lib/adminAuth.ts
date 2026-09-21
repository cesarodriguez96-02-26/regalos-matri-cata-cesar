import crypto from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'cata_cesar_admin';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function adminSecret() {
  return process.env.ADMIN_PASSWORD ?? '';
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

function signature(expiresAt: string) {
  return crypto.createHmac('sha256', adminSecret()).update(`admin:${expiresAt}`).digest('hex');
}

export function isAdminPasswordConfigured() {
  return adminSecret().length >= 16;
}

export function verifyAdminPassword(candidate: string) {
  const secret = adminSecret();
  return secret.length >= 16 && safeEqual(candidate, secret);
}

export function createAdminSessionValue() {
  if (!isAdminPasswordConfigured()) throw new Error('ADMIN_PASSWORD no está configurada de forma segura.');
  const expiresAt = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifyAdminSession(value?: string | null) {
  if (!value || !isAdminPasswordConfigured()) return false;
  const [expiresAt, suppliedSignature] = value.split('.');
  if (!expiresAt || !suppliedSignature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(suppliedSignature, signature(expiresAt));
}

export function getCookieFromRequest(request: Request, name: string) {
  const raw = request.headers.get('cookie') ?? '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function isAdminRequest(request: Request) {
  return verifyAdminSession(getCookieFromRequest(request, ADMIN_COOKIE_NAME));
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ADMIN_SESSION_MAX_AGE
};
