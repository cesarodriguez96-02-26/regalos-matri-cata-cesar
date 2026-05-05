import { prisma } from '@/lib/prisma';
import { flowGetStatus } from '@/lib/flow';
import { sendGuestAndOwnerEmails } from '@/lib/email';

export type FlowSyncResult = {
  ok: boolean;
  status: 'paid' | 'failed' | 'pending' | 'not_found' | 'error';
  commerceOrder?: string;
  flowOrder?: string;
  error?: string;
};

function mapFlowStatus(status: unknown): 'paid' | 'failed' | 'pending' {
  // Flow normalmente usa: 1 pendiente, 2 pagada, 3 rechazada, 4 anulada.
  // Lo convertimos a Number para cubrir respuestas como "2".
  const numericStatus = Number(status);

  if (numericStatus === 2) return 'paid';
  if (numericStatus === 3 || numericStatus === 4) return 'failed';
  return 'pending';
}

function normalizeStoredStatus(status?: string | null): FlowSyncResult['status'] {
  if (status === 'paid') return 'paid';
  if (status === 'failed') return 'failed';
  if (status === 'pending' || status === 'transfer_pending') return 'pending';
  return 'pending';
}

export async function syncFlowPayment(token: string): Promise<FlowSyncResult> {
  if (!token) {
    return { ok: false, status: 'error', error: 'missing token' };
  }

  const purchaseByToken = await prisma.giftPurchase.findFirst({
    where: { flowToken: token }
  });

  try {
    const flowStatus = await flowGetStatus(token);
    const commerceOrder = String(flowStatus.commerceOrder ?? purchaseByToken?.commerceOrder ?? '');
    const flowOrder = String(flowStatus.flowOrder ?? purchaseByToken?.flowOrder ?? '');

    const purchase = commerceOrder
      ? await prisma.giftPurchase.findUnique({ where: { commerceOrder } })
      : purchaseByToken;

    if (!purchase) {
      return { ok: false, status: 'not_found', commerceOrder, flowOrder };
    }

    const newStatus = mapFlowStatus(flowStatus.status);
    const wasAlreadyPaid = purchase.status === 'paid';

    const updated = await prisma.giftPurchase.update({
      where: { id: purchase.id },
      data: {
        status: newStatus,
        flowToken: token,
        flowOrder,
        rawPaymentData: JSON.stringify(flowStatus),
        paidAt: newStatus === 'paid' && !purchase.paidAt ? new Date() : purchase.paidAt
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
        // El pago no debe fallar por un problema de correo.
        console.error('Error enviando correos de confirmación:', emailError);
      }
    }

    return {
      ok: true,
      status: newStatus,
      commerceOrder: updated.commerceOrder,
      flowOrder
    };
  } catch (error) {
    console.error('Error sincronizando pago Flow:', error);

    // Si Flow confirmó por webhook antes que el usuario volviera a la web,
    // evitamos mostrar error y usamos el estado que ya está guardado en BD.
    if (purchaseByToken) {
      return {
        ok: false,
        status: normalizeStoredStatus(purchaseByToken.status),
        commerceOrder: purchaseByToken.commerceOrder,
        flowOrder: purchaseByToken.flowOrder ?? undefined,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    return {
      ok: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
