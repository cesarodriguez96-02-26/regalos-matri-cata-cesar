import { NextResponse } from 'next/server';
import { syncFlowPayment } from '@/lib/flowSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getTokenFromRequest(request: Request) {
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery) return tokenFromQuery;

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

async function confirm(request: Request) {
  const token = await getTokenFromRequest(request);

  // Flow exige HTTP 200. Si prueba el endpoint sin token, respondemos OK.
  if (token) {
    await syncFlowPayment(token);
  }

  return new NextResponse('OK', { status: 200 });
}

export async function POST(request: Request) {
  return confirm(request);
}

export async function GET(request: Request) {
  return confirm(request);
}
