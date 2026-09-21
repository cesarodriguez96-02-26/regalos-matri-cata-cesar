import { NextResponse } from 'next/server';
import { syncFlowPayment } from '@/lib/flowSync';
import { getFlowDataFromRequest } from '@/lib/flowRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
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

  // No propagamos el token de Flow al navegador, historial ni analytics.
  return NextResponse.redirect(url, 303);
}

export async function GET(request: Request) {
  return redirectAfterFlow(request);
}

export async function POST(request: Request) {
  return redirectAfterFlow(request);
}
