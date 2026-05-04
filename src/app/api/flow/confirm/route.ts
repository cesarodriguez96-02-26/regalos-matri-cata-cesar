import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { flowGetStatus } from '@/lib/flow';
import { sendGuestAndOwnerEmails } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get('token') ?? '');

  if (!token) return new NextResponse('missing token', { status: 400 });

  try {
    const status = await flowGetStatus(token);
    const purchase = await prisma.giftPurchase.findUnique({ where: { commerceOrder: status.commerceOrder } });

    if (!purchase) return new NextResponse('order not found', { status: 404 });

    const isPaid = status.status === 2;
    const newStatus = isPaid ? 'paid' : status.status === 3 || status.status === 4 ? 'failed' : 'pending';

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
    console.error(error);
    return new NextResponse('error', { status: 500 });
  }
}
