import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { sendGiftConfirmedEmails } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const purchase = await prisma.giftPurchase.findUnique({ where: { id: params.id } });
  if (!purchase || purchase.paymentMethod !== 'transfer') {
    return NextResponse.json({ error: 'Transferencia no encontrada.' }, { status: 404 });
  }

  if (purchase.status === 'paid') return NextResponse.json({ ok: true, alreadyPaid: true });

  const transitioned = await prisma.giftPurchase.updateMany({
    where: { id: purchase.id, status: { not: 'paid' } },
    data: { status: 'paid', paidAt: purchase.paidAt ?? new Date() }
  });

  const updated = await prisma.giftPurchase.findUnique({ where: { id: purchase.id } });
  if (!updated) return NextResponse.json({ error: 'No se pudo actualizar.' }, { status: 500 });

  if (transitioned.count === 1) {
    try {
      await sendGiftConfirmedEmails({
        guestName: updated.guestName,
        guestEmail: updated.guestEmail,
        giftTitle: updated.giftTitle,
        amount: updated.amount,
        message: updated.guestMessage,
        commerceOrder: updated.commerceOrder
      });
      await prisma.giftPurchase.update({ where: { id: updated.id }, data: { notificationSentAt: new Date() } });
    } catch (emailError) {
      console.error('Error enviando confirmación de transferencia:', emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
