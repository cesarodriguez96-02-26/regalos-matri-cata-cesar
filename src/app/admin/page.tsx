import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { formatCLP } from '@/lib/format';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/adminAuth';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { AdminActions } from '@/components/AdminActions';
import { ConfirmTransferButton } from '@/components/ConfirmTransferButton';

export const dynamic = 'force-dynamic';

const statusLabel: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente Flow',
  failed: 'Fallido',
  transfer_pending: 'Transferencia pendiente'
};

const statusClass: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  transfer_pending: 'bg-blue-50 text-blue-800 ring-blue-200'
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

export default async function AdminPage() {
  const authorized = verifyAdminSession(cookies().get(ADMIN_COOKIE_NAME)?.value);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <section className="w-full max-w-md rounded-[2rem] border border-navy/10 bg-ivory p-7 text-center shadow-ticket md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Cata & César</p>
          <h1 className="mt-3 font-serif text-4xl text-navy">Panel privado</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">La clave ya no viaja en la URL. El acceso se guarda en una cookie segura y temporal.</p>
          <AdminLoginForm />
        </section>
      </main>
    );
  }

  const purchases = await prisma.giftPurchase.findMany({ orderBy: { createdAt: 'desc' } });
  const paid = purchases.filter((item) => item.status === 'paid');
  const totalPaid = paid.reduce((sum, item) => sum + item.amount, 0);
  const transferPending = purchases.filter((item) => item.status === 'transfer_pending').length;
  const flowPending = purchases.filter((item) => item.paymentMethod === 'flow' && item.status === 'pending').length;

  return (
    <main className="min-h-screen px-5 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Administración · Cata & César</p>
            <h1 className="mt-2 font-serif text-4xl text-navy md:text-5xl">Regalos recibidos</h1>
          </div>
          <AdminActions />
        </div>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Total confirmado', formatCLP(totalPaid)],
            ['Regalos pagados', String(paid.length)],
            ['Transferencias por verificar', String(transferPending)],
            ['Pagos Flow pendientes', String(flowPending)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-navy/10 bg-ivory p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">{label}</p>
              <p className="mt-2 font-serif text-3xl text-navy">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-7 overflow-x-auto rounded-[1.75rem] border border-navy/10 bg-white shadow-xl shadow-navy/5">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Invitado</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Regalo</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Mensaje</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((item) => (
                <tr key={item.id} className="border-t border-navy/8 align-top even:bg-paper/35">
                  <td className="whitespace-nowrap p-4 text-ink/60">{formatDate(item.createdAt)}</td>
                  <td className="p-4">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass[item.status] ?? 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-navy">{item.guestName}</td>
                  <td className="p-4 text-ink/65">{item.guestEmail}</td>
                  <td className="p-4">{item.giftTitle}</td>
                  <td className="whitespace-nowrap p-4 font-bold">{formatCLP(item.amount)}</td>
                  <td className="max-w-xs p-4 leading-6 text-ink/65">{item.guestMessage || '—'}</td>
                  <td className="p-4">
                    {item.paymentMethod === 'transfer' && item.status === 'transfer_pending' ? (
                      <ConfirmTransferButton id={item.id} />
                    ) : (
                      <span className="text-xs text-ink/35">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-ink/50">Aún no hay regalos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
