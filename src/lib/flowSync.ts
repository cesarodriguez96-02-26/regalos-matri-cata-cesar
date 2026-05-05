import { prisma } from '@/lib/prisma';
import { flowGetStatus, flowGetStatusByCommerceId, type FlowPaymentStatus } from '@/lib/flow';
import { sendGuestAndOwnerEmails } from '@/lib/email';

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

    const newStatus = mapFlowStatus(flowStatus.status);
    const wasAlreadyPaid = finalPurchase.status === 'paid';
    const tokenToStore = token ?? finalPurchase.flowToken;

    const updated = await prisma.giftPurchase.update({
      where: { id: finalPurchase.id },
      data: {
        status: newStatus,
        flowToken: tokenToStore,
        flowOrder: finalFlowOrder || finalPurchase.flowOrder,
        rawPaymentData: JSON.stringify(flowStatus),
        paidAt: newStatus === 'paid' && !finalPurchase.paidAt ? new Date() : finalPurchase.paidAt
      }
    });

    if (newStatus === 'paid' && !wasAlreadyPaid) {
      try {
        await sendGuestAndOwnerEmails({
          guestName: updated.guestName,
          guestEmail: updated.guestEmail,
          giftTitle: updated.giftTitle,
          amount: updated.amount,
          message: updated.guestMessage,
          commerceOrder: updated.commerceOrder
        });
      } catch (emailError) {
        console.error('Error enviando correos de confirmación:', emailError);
      }
    }

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
