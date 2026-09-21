import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { giftOptions } from '@/config/gifts';
import { prisma } from '@/lib/prisma';
import { buildFlowPaymentUrl, flowPost } from '@/lib/flow';
import { sendTransferPendingEmails } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  giftId: z.string().trim().min(1).max(80),
  guestName: z.string().trim().min(3).max(120),
  guestEmail: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  guestMessage: z.string().trim().max(1200).optional().nullable(),
  paymentMethod: z.enum(['flow', 'transfer']),
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

    // Honeypot y tiempo mínimo: reduce bots triviales sin agregar fricción al invitado.
    if (input.website || (input.formStartedAt && Date.now() - input.formStartedAt < 700)) {
      return NextResponse.json({ error: 'No se pudo validar la solicitud.' }, { status: 400 });
    }

    const gift = giftOptions.find((item) => item.id === input.giftId);
    if (!gift) return NextResponse.json({ error: 'Regalo no encontrado.' }, { status: 404 });

    const commerceOrder = `REG-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;

    const purchase = await prisma.giftPurchase.create({
      data: {
        commerceOrder,
        giftId: gift.id,
        giftTitle: gift.title,
        amount: gift.amount,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestMessage: input.guestMessage || null,
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === 'transfer' ? 'transfer_pending' : 'pending'
      }
    });

    if (input.paymentMethod === 'transfer') {
      try {
        await sendTransferPendingEmails({
          guestName: purchase.guestName,
          guestEmail: purchase.guestEmail,
          giftTitle: purchase.giftTitle,
          amount: purchase.amount,
          commerceOrder: purchase.commerceOrder
        });
      } catch (emailError) {
        console.error('Error enviando aviso de transferencia:', emailError);
      }
      return NextResponse.json({ ok: true, purchaseId: purchase.id });
    }

    const siteUrl = getBaseUrl();
    const confirmationUrl = new URL('/api/flow/confirm', siteUrl);
    confirmationUrl.searchParams.set('commerceOrder', commerceOrder);

    const returnUrl = new URL('/api/flow/return', siteUrl);
    returnUrl.searchParams.set('commerceOrder', commerceOrder);

    try {
      const result = await flowPost<{ url: string; token: string; flowOrder?: number }>('/payment/create', {
        commerceOrder,
        subject: `Regalo matrimonio Cata & César - ${gift.title}`,
        currency: 'CLP',
        amount: gift.amount,
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
      return NextResponse.json(
        { error: 'No pudimos iniciar el pago en este momento. Intenta nuevamente en unos minutos.' },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Revisa los datos ingresados e inténtalo nuevamente.' }, { status: 422 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'No pudimos registrar el regalo. Intenta nuevamente.' }, { status: 500 });
  }
}
