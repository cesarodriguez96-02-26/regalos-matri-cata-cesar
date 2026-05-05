import { NextResponse } from 'next/server';
import { syncFlowPayment } from '@/lib/flowSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getFlowDataFromRequest(request: Request) {
  const url = new URL(request.url);
  const commerceOrder = url.searchParams.get('commerceOrder') ?? '';
  const tokenFromQuery = url.searchParams.get('token') ?? '';

  if (tokenFromQuery) return { token: tokenFromQuery, commerceOrder };

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null);
    return {
      token: String(body?.token ?? ''),
      commerceOrder: String(body?.commerceOrder ?? commerceOrder ?? '')
    };
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData().catch(() => null);
    return {
      token: String(formData?.get('token') ?? ''),
      commerceOrder: String(formData?.get('commerceOrder') ?? commerceOrder ?? '')
    };
  }

  const text = await request.text().catch(() => '');
  const params = new URLSearchParams(text);
  return {
    token: String(params.get('token') ?? ''),
    commerceOrder: String(params.get('commerceOrder') ?? commerceOrder ?? '')
  };
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

async function redirectAfterFlow(request: Request) {
  const { token, commerceOrder } = await getFlowDataFromRequest(request);
  let status: 'paid' | 'failed' | 'pending' | 'not_found' | 'error' = 'pending';

  if (token || commerceOrder) {
    const result = await syncFlowPayment({ token, commerceOrder });
    status = result.status;
  }

  const url = new URL('/gracias', getBaseUrl());
  url.searchParams.set('status', status);

  if (commerceOrder) url.searchParams.set('commerceOrder', commerceOrder);
  if (token) url.searchParams.set('token', token);

  return NextResponse.redirect(url, 303);
}

export async function GET(request: Request) {
  return redirectAfterFlow(request);
}

export async function POST(request: Request) {
  return redirectAfterFlow(request);
}
