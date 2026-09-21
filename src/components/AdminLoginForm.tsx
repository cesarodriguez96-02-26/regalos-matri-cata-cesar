'use client';

import { useState } from 'react';

export function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'No se pudo iniciar sesión.');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7">
      <label className="block text-left">
        <span className="text-sm font-bold text-ink/70">Clave de administración</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 outline-none focus:border-gold focus:ring-4 focus:ring-gold/10"
          required
        />
      </label>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="mt-4 w-full rounded-full bg-navy px-5 py-3.5 font-bold text-white disabled:opacity-60">
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
