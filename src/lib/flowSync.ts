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

function mapFlowStatus(status: number) {
  // Flow: 1 pendiente, 2 pagada, 3 rechazada, 4 anulada
  if (status === 2) return 'paid';
  if (status === 3 || status === 4) return 'failed';
  return 'pending';
}

export async function syncFlowPayment(token: string): Promise<FlowSyncResult> {
  if (!token) {
    return { ok: false, status: 'error', error: 'missing token' };
  }

  try {
    const flowStatus = await flowGetStatus(token);
    const commerceOrder = String(flowStatus.commerceOrder ?? '');
    const flowOrder = String(flowStatus.flowOrder ?? '');

    if (!commerceOrder) {
      return { ok: false, status: 'error', error: 'missing commerceOrder' };
    }

    const purchase = await prisma.giftPurchase.findUnique({
      where: { commerceOrder }
    });

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
        console.error('Error enviando correos de confirmación:', emailError);
      }
    }

    return {
      ok: true,
      status: newStatus,
      commerceOrder,
      flowOrder
    };
  } catch (error) {
    console.error('Error sincronizando pago Flow:', error);
    return {
      ok: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
