import { prisma } from '@/lib/prisma';
import { formatCLP } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: { password?: string } }) {
  const authorized = process.env.ADMIN_PASSWORD && searchParams.password === process.env.ADMIN_PASSWORD;

  if (!authorized) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl text-wine">Panel privado</h1>
        <p className="mt-4 text-ink/70">Ingresa con /admin?password=TU_CLAVE</p>
      </main>
    );
  }

  const purchases = await prisma.giftPurchase.findMany({ orderBy: { createdAt: 'desc' } });
  const totalPaid = purchases.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-wine">Regalos recibidos</h1>
          <p className="mt-2 text-ink/70">Total pagado confirmado: <strong>{formatCLP(totalPaid)}</strong></p>
        </div>
        <a className="rounded-full bg-wine px-5 py-3 font-semibold text-white" href={`/api/admin/export?password=${searchParams.password}`}>Descargar CSV</a>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-xl shadow-wine/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cream text-wine">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Invitado</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Regalo</th>
              <th className="p-4">Monto</th>
              <th className="p-4">Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((item) => (
              <tr key={item.id} className="border-t border-wine/10 align-top">
                <td className="p-4">{item.createdAt.toLocaleString('es-CL')}</td>
                <td className="p-4">{item.status}</td>
                <td className="p-4 font-semibold">{item.guestName}</td>
                <td className="p-4">{item.guestEmail}</td>
                <td className="p-4">{item.giftTitle}</td>
                <td className="p-4">{formatCLP(item.amount)}</td>
                <td className="max-w-xs p-4">{item.guestMessage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
