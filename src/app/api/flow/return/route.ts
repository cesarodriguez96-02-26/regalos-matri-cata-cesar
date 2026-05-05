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

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

async function redirectAfterFlow(request: Request) {
  const token = await getTokenFromRequest(request);
  let status = 'pending';

  if (token) {
    const result = await syncFlowPayment(token);
    status = result.status;
  }

  const url = new URL('/gracias', getBaseUrl());
  url.searchParams.set('status', status);

  if (token) {
    url.searchParams.set('token', token);
  }

  return NextResponse.redirect(url, 303);
}

export async function GET(request: Request) {
  return redirectAfterFlow(request);
}

export async function POST(request: Request) {
  return redirectAfterFlow(request);
}
