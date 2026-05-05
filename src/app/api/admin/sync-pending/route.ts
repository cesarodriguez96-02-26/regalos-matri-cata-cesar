import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncFlowPayment } from '@/lib/flowSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const purchases = await prisma.giftPurchase.findMany({
    where: {
      paymentMethod: 'flow',
      status: 'pending'
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const results = [];

  for (const purchase of purchases) {
    const result = await syncFlowPayment({
      token: purchase.flowToken,
      commerceOrder: purchase.commerceOrder
    });

    results.push({
      commerceOrder: purchase.commerceOrder,
      previousStatus: purchase.status,
      newStatus: result.status,
      ok: result.ok,
      error: result.error ?? null
    });
  }

  return NextResponse.json({ synced: results.length, results });
}
