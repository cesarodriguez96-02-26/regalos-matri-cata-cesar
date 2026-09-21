import { NextResponse } from 'next/server';
import { syncFlowPayment } from '@/lib/flowSync';
import { getFlowDataFromRequest } from '@/lib/flowRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token, commerceOrder } = await getFlowDataFromRequest(request);
    await syncFlowPayment({ token, commerceOrder });
  } catch (error) {
    console.error('Flow confirmation error:', error);
  }

  // Flow espera HTTP 200 del callback. El estado real siempre se valida consultando su API.
  return new NextResponse('OK', { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
