import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionValue,
  isAdminPasswordConfigured,
  verifyAdminPassword
} from '@/lib/adminAuth';

export const runtime = 'nodejs';

const schema = z.object({ password: z.string().min(1).max(300) });

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json({ error: 'El panel no está configurado correctamente.' }, { status: 503 });
  }

  try {
    const { password } = schema.parse(await request.json());
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Clave incorrecta.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), adminCookieOptions);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
    }
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'No se pudo iniciar sesión.' }, { status: 500 });
  }
}
