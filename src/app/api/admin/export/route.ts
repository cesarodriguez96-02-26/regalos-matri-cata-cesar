import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function neutralizeSpreadsheetFormula(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvEscape(value: unknown) {
  const text = neutralizeSpreadsheetFormula(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const purchases = await prisma.giftPurchase.findMany({ orderBy: { createdAt: 'desc' } });
  const header = ['fecha_creacion', 'fecha_pago', 'estado', 'metodo_pago', 'nombre', 'correo', 'regalo', 'monto', 'mensaje', 'orden_comercio', 'flow_order'];
  const rows = purchases.map((item) => [
    item.createdAt.toISOString(),
    item.paidAt?.toISOString() ?? '',
    item.status,
    item.paymentMethod,
    item.guestName,
    item.guestEmail,
    item.giftTitle,
    item.amount,
    item.guestMessage ?? '',
    item.commerceOrder,
    item.flowOrder ?? ''
  ]);

  // BOM UTF-8 para que Excel en Windows detecte bien tildes y ñ.
  const csv = '\uFEFF' + [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="regalos-cata-cesar.csv"',
      'Cache-Control': 'no-store'
    }
  });
}
