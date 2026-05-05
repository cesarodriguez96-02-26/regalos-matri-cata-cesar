import { NextResponse } from 'next/server';
import { syncFlowPayment } from '@/lib/flowSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getTokenFromRequest(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null);
    return String(body?.token ?? '');
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData().catch(() => null);
    return String(formData?.get('token') ?? '');
  }

  const text = await request.text().catch(() => '');
  const params = new URLSearchParams(text);
  return String(params.get('token') ?? '');
}

export async function POST(request: Request) {
  const token = await getTokenFromRequest(request);

  // Flow necesita recibir HTTP 200. Si prueba el endpoint sin token, respondemos OK.
  if (!token) {
    return new NextResponse('OK', { status: 200 });
  }

  await syncFlowPayment(token);
  return new NextResponse('OK', { status: 200 });
}

export async function GET() {
  return new NextResponse('OK', { status: 200 });
}
