import { prisma } from '@/lib/prisma';
import { flowGetStatus, flowGetStatusByCommerceId, type FlowPaymentStatus } from '@/lib/flow';
import { sendGiftConfirmedEmails } from '@/lib/email';

export type FlowSyncResult = {
  ok: boolean;
  status: 'paid' | 'failed' | 'pending' | 'not_found' | 'error';
  commerceOrder?: string;
  flowOrder?: string;
  error?: string;
};

export type FlowSyncInput = {
  token?: string | null;
  commerceOrder?: string | null;
};

function mapFlowStatus(status: unknown): 'paid' | 'failed' | 'pending' {
  const numericStatus = Number(status);
  if (numericStatus === 2) return 'paid';
  if (numericStatus === 3 || numericStatus === 4) return 'failed';
  return 'pending';
}

function normalizeStoredStatus(status?: string | null): FlowSyncResult['status'] {
  if (status === 'paid') return 'paid';
  if (status === 'failed') return 'failed';
  return 'pending';
}

function safePaymentSnapshot(flowStatus: FlowPaymentStatus) {
  return JSON.stringify({
    flowOrder: flowStatus.flowOrder,
    commerceOrder: flowStatus.commerceOrder,
    requestDate: flowStatus.requestDate,
    status: flowStatus.status,
    currency: flowStatus.currency,
    amount: flowStatus.amount
  });
}

async function tryGetFlowStatus(input: FlowSyncInput, storedToken?: string | null) {
  const attempts: Array<() => Promise<FlowPaymentStatus>> = [];

  if (input.token) attempts.push(() => flowGetStatus(input.token!));
  if (input.commerceOrder) attempts.push(() => flowGetStatusByCommerceId(input.commerceOrder!));
  if (storedToken && storedToken !== input.token) attempts.push(() => flowGetStatus(storedToken));

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
      console.error('Intento fallido consultando estado Flow:', error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo consultar estado Flow.');
}

export async function syncFlowPayment(input: string | FlowSyncInput): Promise<FlowSyncResult> {
  const normalizedInput: FlowSyncInput = typeof input === 'string' ? { token: input } : input;
  const token = normalizedInput.token?.trim() || null;
  const commerceOrder = normalizedInput.commerceOrder?.trim() || null;

  if (!token && !commerceOrder) {
    return { ok: false, status: 'error', error: 'missing token and commerceOrder' };
  }

  const purchase = commerceOrder
    ? await prisma.giftPurchase.findUnique({ where: { commerceOrder } })
    : token
      ? await prisma.giftPurchase.findFirst({ where: { flowToken: token } })
      : null;

  try {
    const flowStatus = await tryGetFlowStatus({ token, commerceOrder }, purchase?.flowToken);
    const finalCommerceOrder = String(flowStatus.commerceOrder ?? commerceOrder ?? purchase?.commerceOrder ?? '');
    const finalFlowOrder = String(flowStatus.flowOrder ?? purchase?.flowOrder ?? '');

    const finalPurchase = finalCommerceOrder
      ? await prisma.giftPurchase.findUnique({ where: { commerceOrder: finalCommerceOrder } })
      : purchase;

    if (!finalPurchase) {
      return {
        ok: false,
        status: 'not_found',
        commerceOrder: finalCommerceOrder || undefined,
        flowOrder: finalFlowOrder || undefined
      };
    }

    if (finalCommerceOrder !== finalPurchase.commerceOrder) {
      throw new Error('La orden reportada por Flow no coincide con la orden almacenada.');
    }

    const newStatus = mapFlowStatus(flowStatus.status);
    const flowAmount = Number(flowStatus.amount);

    if (newStatus === 'paid') {
      if (!Number.isFinite(flowAmount) || flowAmount !== finalPurchase.amount) {
        throw new Error('El monto confirmado por Flow no coincide con el monto del regalo.');
      }
      if (flowStatus.currency && flowStatus.currency !== 'CLP') {
        throw new Error('La moneda confirmada por Flow no coincide con CLP.');
      }
    }

    const commonData = {
      flowToken: token ?? finalPurchase.flowToken,
      flowOrder: finalFlowOrder || finalPurchase.flowOrder,
      rawPaymentData: safePaymentSnapshot(flowStatus)
    };

    if (newStatus === 'paid') {
      const transitioned = await prisma.giftPurchase.updateMany({
        where: { id: finalPurchase.id, status: { not: 'paid' } },
        data: {
          ...commonData,
          status: 'paid',
          paidAt: finalPurchase.paidAt ?? new Date()
        }
      });

      const updated = await prisma.giftPurchase.findUnique({ where: { id: finalPurchase.id } });
      if (!updated) throw new Error('No se pudo recuperar la orden actualizada.');

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
          await prisma.giftPurchase.update({
            where: { id: updated.id },
            data: { notificationSentAt: new Date() }
          });
        } catch (emailError) {
          console.error('Error enviando correos de confirmación:', emailError);
        }
      }

      return {
        ok: true,
        status: 'paid',
        commerceOrder: updated.commerceOrder,
        flowOrder: finalFlowOrder || undefined
      };
    }

    if (finalPurchase.status === 'paid') {
      return {
        ok: true,
        status: 'paid',
        commerceOrder: finalPurchase.commerceOrder,
        flowOrder: finalPurchase.flowOrder ?? undefined
      };
    }

    const updated = await prisma.giftPurchase.update({
      where: { id: finalPurchase.id },
      data: { ...commonData, status: newStatus }
    });

    return {
      ok: true,
      status: newStatus,
      commerceOrder: updated.commerceOrder,
      flowOrder: finalFlowOrder || undefined
    };
  } catch (error) {
    console.error('Error sincronizando pago Flow:', error);

    if (purchase) {
      return {
        ok: false,
        status: normalizeStoredStatus(purchase.status),
        commerceOrder: purchase.commerceOrder,
        flowOrder: purchase.flowOrder ?? undefined,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    return {
      ok: false,
      status: 'error',
      commerceOrder: commerceOrder ?? undefined,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
