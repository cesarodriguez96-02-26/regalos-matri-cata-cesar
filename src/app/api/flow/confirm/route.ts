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

export async function POST(request: Request) {
  try {
    const { token, commerceOrder } = await getFlowDataFromRequest(request);
    await syncFlowPayment({ token, commerceOrder });
  } catch (error) {
    console.error('Flow confirmation error:', error);
  }

  // Flow exige HTTP 200 aunque exista un error interno; el error queda en los logs.
  return new NextResponse('OK', { status: 200 });
}

export async function GET() {
  return new NextResponse('OK', { status: 200 });
}
