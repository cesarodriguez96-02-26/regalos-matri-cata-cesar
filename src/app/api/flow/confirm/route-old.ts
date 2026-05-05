import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { flowGetStatus } from '@/lib/flow';
import { sendGuestAndOwnerEmails } from '@/lib/email';

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

  if (!token) {
    return new NextResponse('OK', { status: 200 });
  }

  try {
    const status = await flowGetStatus(token);

    const purchase = await prisma.giftPurchase.findUnique({
      where: { commerceOrder: status.commerceOrder }
    });

    if (!purchase) {
      return new NextResponse('OK', { status: 200 });
    }

    const isPaid = status.status === 2;
    const newStatus =
      isPaid ? 'paid' : status.status === 3 || status.status === 4 ? 'failed' : 'pending';

    const updated = await prisma.giftPurchase.update({
      where: { id: purchase.id },
      data: {
        status: newStatus,
        flowToken: token,
        flowOrder: String(status.flowOrder),
        rawPaymentData: JSON.stringify(status),
        paidAt: isPaid && !purchase.paidAt ? new Date() : purchase.paidAt
      }
    });

    if (isPaid && purchase.status !== 'paid') {
      await sendGuestAndOwnerEmails({
        guestName: updated.guestName,
        guestEmail: updated.guestEmail,
        giftTitle: updated.giftTitle,
        amount: updated.amount,
        message: updated.guestMessage,
        commerceOrder: updated.commerceOrder
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Flow confirmation error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}

export async function GET() {
  return new NextResponse('OK', { status: 200 });
}