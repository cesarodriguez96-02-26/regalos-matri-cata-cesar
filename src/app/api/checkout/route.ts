import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { giftOptions } from '@/config/gifts';
import { prisma } from '@/lib/prisma';
import { buildFlowPaymentUrl, flowPost } from '@/lib/flow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  items: z.array(z.object({
    giftId: z.string().trim().min(1).max(80),
    quantity: z.number().int().min(1).max(20)
  })).min(1).max(10),
  guestName: z.string().trim().min(3).max(120),
  guestEmail: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  guestMessage: z.string().trim().max(1200).optional().nullable(),
  paymentMethod: z.literal('flow'),
  website: z.string().max(200).optional().default(''),
  formStartedAt: z.number().int().positive().optional()
});

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = new URL(raw);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL debe usar HTTPS en producción.');
  }
  return raw.replace(/\/$/, '');
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > 20_000) {
      return NextResponse.json({ error: 'La solicitud es demasiado grande.' }, { status: 413 });
    }

    const input = schema.parse(await request.json());
    if (input.website || (input.formStartedAt && Date.now() - input.formStartedAt < 700)) {
      return NextResponse.json({ error: 'No se pudo validar la solicitud.' }, { status: 400 });
    }

    const ids = input.items.map((item) => item.giftId);
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: 'Hay regalos duplicados. Revisa tu selección.' }, { status: 422 });
    }

    const cart = input.items.map(({ giftId, quantity }) => {
      const gift = giftOptions.find((item) => item.id === giftId);
      return gift ? { id: gift.id, title: gift.title, amount: gift.amount, quantity } : null;
    });
    if (cart.some((item) => !item)) {
      return NextResponse.json({ error: 'Uno de los regalos seleccionados ya no está disponible.' }, { status: 422 });
    }

    const validCart = cart.filter((item): item is NonNullable<typeof item> => item !== null);
    const total = validCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    if (!Number.isSafeInteger(total) || total <= 0 || total > 10_000_000) {
      return NextResponse.json({ error: 'Revisa el total de tu selección.' }, { status: 422 });
    }
    const giftSummary = validCart.map((item) => `${item.quantity} × ${item.title}`).join(' · ');
    const commerceOrder = `REG-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;

    // Guardamos el desglose en giftId como JSON y la descripción legible en giftTitle.
    // Compatibilidad con compras antiguas y sin migración de Neon.
    const purchase = await prisma.giftPurchase.create({
      data: {
        commerceOrder,
        giftId: JSON.stringify(validCart),
        giftTitle: giftSummary,
        amount: total,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestMessage: input.guestMessage || null,
        paymentMethod: 'flow',
        status: 'pending'
      }
    });

    const siteUrl = getBaseUrl();
    const confirmationUrl = new URL('/api/flow/confirm', siteUrl);
    confirmationUrl.searchParams.set('commerceOrder', commerceOrder);
    const returnUrl = new URL('/api/flow/return', siteUrl);
    returnUrl.searchParams.set('commerceOrder', commerceOrder);

    try {
      const result = await flowPost<{ url: string; token: string; flowOrder?: number }>('/payment/create', {
        commerceOrder,
        subject: `Regalos matrimonio Cata y César (${validCart.reduce((sum, item) => sum + item.quantity, 0)})`,
        currency: 'CLP',
        amount: total,
        email: input.guestEmail,
        paymentMethod: 9,
        urlConfirmation: confirmationUrl.toString(),
        urlReturn: returnUrl.toString(),
        optional: JSON.stringify({ purchaseId: purchase.id })
      });

      if (!result.url || !result.token) throw new Error('Flow no devolvió URL o token de pago.');
      await prisma.giftPurchase.update({
        where: { id: purchase.id },
        data: { flowToken: result.token, flowOrder: result.flowOrder ? String(result.flowOrder) : null }
      });
      return NextResponse.json({ paymentUrl: buildFlowPaymentUrl(result.url, result.token) });
    } catch (flowError) {
      console.error('Error creando pago Flow:', flowError);
      await prisma.giftPurchase.update({ where: { id: purchase.id }, data: { status: 'failed' } }).catch(() => null);
      return NextResponse.json({ error: 'No pudimos iniciar el pago en este momento. Intenta nuevamente en unos minutos.' }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Revisa tus regalos, cantidades y datos antes de continuar.' }, { status: 422 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'No pudimos registrar los regalos. Intenta nuevamente.' }, { status: 500 });
  }
}
