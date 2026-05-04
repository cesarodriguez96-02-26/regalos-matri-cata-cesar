import { NextResponse } from 'next/server';
import { z } from 'zod';
import { giftOptions } from '@/config/gifts';
import { prisma } from '@/lib/prisma';
import { flowPost } from '@/lib/flow';

export const runtime = 'nodejs';

const schema = z.object({
  giftId: z.string(),
  guestName: z.string().min(3).max(120),
  guestEmail: z.string().email().max(180),
  guestMessage: z.string().max(1200).optional().nullable(),
  paymentMethod: z.enum(['flow', 'transfer'])
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const gift = giftOptions.find((item) => item.id === input.giftId);
    if (!gift) return NextResponse.json({ error: 'Regalo no encontrado.' }, { status: 404 });

    const commerceOrder = `REG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const purchase = await prisma.giftPurchase.create({
      data: {
        commerceOrder,
        giftId: gift.id,
        giftTitle: gift.title,
        amount: gift.amount,
        guestName: input.guestName.trim(),
        guestEmail: input.guestEmail.trim().toLowerCase(),
        guestMessage: input.guestMessage?.trim(),
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === 'transfer' ? 'transfer_pending' : 'pending'
      }
    });

    if (input.paymentMethod === 'transfer') {
      return NextResponse.json({ ok: true, purchaseId: purchase.id });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const result = await flowPost<{ url: string; token: string; flowOrder?: number }>('/payment/create', {
      commerceOrder,
      subject: `Regalo matrimonio Catalina & César - ${gift.title}`,
      currency: 'CLP',
      amount: gift.amount,
      email: input.guestEmail,
      paymentMethod: 9,
      urlConfirmation: `${siteUrl}/api/flow/confirm`,
      urlReturn: `${siteUrl}/api/flow/return`
    });

    await prisma.giftPurchase.update({
      where: { id: purchase.id },
      data: { flowToken: result.token, flowOrder: result.flowOrder ? String(result.flowOrder) : null }
    });

    return NextResponse.json({ paymentUrl: `${result.url}?token=${result.token}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al crear el regalo.' }, { status: 400 });
  }
}
