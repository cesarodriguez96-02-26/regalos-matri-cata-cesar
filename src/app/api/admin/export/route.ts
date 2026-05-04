import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
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

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="regalos-catalina-cesar.csv"'
    }
  });
}
