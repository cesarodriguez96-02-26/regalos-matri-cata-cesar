'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminActions() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  async function sync() {
    setSyncing(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/sync-pending', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'No se pudo sincronizar.');
      setMessage(`Sincronizadas: ${data.synced ?? 0}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al sincronizar.');
    } finally {
      setSyncing(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href="/api/admin/export" className="rounded-full border border-navy/15 bg-white px-4 py-2.5 text-sm font-bold text-navy">Descargar CSV</a>
      <button onClick={sync} disabled={syncing} className="rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {syncing ? 'Sincronizando...' : 'Sincronizar Flow'}
      </button>
      <button onClick={logout} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink/55 hover:bg-white">Salir</button>
      {message && <span className="text-xs text-ink/55">{message}</span>}
    </div>
  );
}
