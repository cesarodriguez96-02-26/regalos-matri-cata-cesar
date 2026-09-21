'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ConfirmTransferButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirmTransfer() {
    if (!window.confirm('¿Confirmas que verificaste esta transferencia en el banco?')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/transfers/${encodeURIComponent(id)}/confirm`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'No se pudo confirmar.');
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo confirmar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={confirmTransfer} disabled={loading} className="rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
      {loading ? 'Confirmando...' : 'Confirmar transferencia'}
    </button>
  );
}
