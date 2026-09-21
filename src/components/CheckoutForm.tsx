'use client';

import { useMemo, useRef, useState } from 'react';
import { GiftOption, giftOptions } from '@/config/gifts';
import { GiftCard } from './GiftCard';
import { formatCLP } from '@/lib/format';

type CheckoutMode = 'flow' | 'transfer';
type TransferDetail = { label: string; value: string };

export function CheckoutForm({ transferDetails }: { transferDetails: TransferDetail[] }) {
  const [selected, setSelected] = useState<GiftOption>(giftOptions[0]);
  const [mode, setMode] = useState<CheckoutMode>('flow');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [formStartedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [transferSaved, setTransferSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleGiftSelect(gift: GiftOption) {
    setSelected(gift);
    setTransferSaved(false);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  const isValid = useMemo(
    () => guestName.trim().length >= 3 && guestName.trim().length <= 120 && /^\S+@\S+\.\S+$/.test(guestEmail.trim()),
    [guestName, guestEmail]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setTransferSaved(false);

    if (!isValid) {
      setError('Ingresa tu nombre y un correo válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: selected.id,
          guestName,
          guestEmail,
          guestMessage,
          paymentMethod: mode,
          website,
          formStartedAt
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'No se pudo registrar el regalo.');

      if (mode === 'flow') {
        window.location.assign(data.paymentUrl);
        return;
      }

      setTransferSaved(true);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  async function copyTransferDetails() {
    const text = transferDetails.map((item) => `${item.label}: ${item.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="regalos" className="px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Nuestra lista de deseos</p>
          <h2 className="mt-3 font-serif text-4xl text-navy md:text-5xl">Elige un regalo simbólico</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/68">
            Cada opción representa una experiencia de nuestra próxima aventura. El monto y el pago son reales; el nombre del regalo es simbólico.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {giftOptions.map((gift) => (
            <GiftCard key={gift.id} gift={gift} selected={gift.id === selected.id} onSelect={handleGiftSelect} />
          ))}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="ticket-edge mt-12 scroll-mt-5 overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket"
        >
          <div className="border-b border-dashed border-navy/15 bg-navy px-6 py-4 text-white md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold-soft">Tu selección</p>
                <p className="mt-1 font-serif text-2xl">{selected.title}</p>
              </div>
              <p className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/15">{formatCLP(selected.amount)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">1</span>
                <h3 className="font-serif text-2xl text-navy">Tus datos y mensaje</h3>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Nombre</span>
                  <input
                    required
                    autoComplete="name"
                    maxLength={120}
                    className="mt-2 w-full rounded-2xl border border-navy/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/10"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: María González"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Correo</span>
                  <input
                    required
                    autoComplete="email"
                    maxLength={180}
                    className="mt-2 w-full rounded-2xl border border-navy/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/10"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="correo@ejemplo.cl"
                    type="email"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-ink/70">Mensaje para Cata & César</span>
                <textarea
                  maxLength={1200}
                  className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-navy/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/10"
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Déjanos unas palabras para guardar junto a este recuerdo..."
                />
                <span className="mt-1 block text-right text-xs text-ink/40">{guestMessage.length}/1200</span>
              </label>

              <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label>
                  Sitio web
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>
            </div>

            <div className="border-t border-dashed border-navy/15 bg-paper/70 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">2</span>
                <h3 className="font-serif text-2xl text-navy">Cómo quieres regalar</h3>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  aria-pressed={mode === 'flow'}
                  onClick={() => { setMode('flow'); setTransferSaved(false); }}
                  className={`rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft ${
                    mode === 'flow' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/20' : 'border-navy/10 bg-white/55 hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-navy">Tarjeta débito / crédito</strong>
                      <span className="mt-1 block text-sm leading-6 text-ink/60">El pago se completa en Flow. Nuestro sitio no recibe ni almacena los datos de tu tarjeta.</span>
                    </div>
                    <span className="text-xl" aria-hidden="true">💳</span>
                  </div>
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'transfer'}
                  onClick={() => { setMode('transfer'); setTransferSaved(false); }}
                  className={`rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft ${
                    mode === 'transfer' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/20' : 'border-navy/10 bg-white/55 hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-navy">Transferencia bancaria</strong>
                      <span className="mt-1 block text-sm leading-6 text-ink/60">Registraremos el regalo como pendiente hasta verificar la transferencia.</span>
                    </div>
                    <span className="text-xl" aria-hidden="true">🏦</span>
                  </div>
                </button>
              </div>

              {mode === 'transfer' && (
                <div className="mt-4 rounded-2xl border border-gold/20 bg-white p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-navy">Datos para transferir</p>
                    <button type="button" onClick={copyTransferDetails} className="text-xs font-bold text-gold hover:text-navy">
                      {copied ? 'Copiado ✓' : 'Copiar datos'}
                    </button>
                  </div>
                  <dl className="mt-3 space-y-2">
                    {transferDetails.map((item) => (
                      <div key={item.label} className="grid grid-cols-[110px_1fr] gap-3">
                        <dt className="text-ink/50">{item.label}</dt>
                        <dd className="break-words font-semibold text-ink/80">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 border-t border-navy/8 pt-3 text-xs leading-5 text-ink/50">
                    Después de realizar la transferencia, presiona el botón para que podamos asociarla a tu nombre y regalo.
                  </p>
                </div>
              )}

              <div aria-live="polite">
                {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}
                {transferSaved && (
                  <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                    ¡Gracias! Registramos tu regalo por transferencia. Quedará confirmado cuando verifiquemos el abono.
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                className="mt-5 w-full rounded-full bg-navy px-6 py-4 font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-navy-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Procesando...' : mode === 'flow' ? 'Continuar al pago seguro' : 'Registrar regalo por transferencia'}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-ink/45">
                Al continuar, solo usaremos tus datos para registrar este regalo y enviarte su confirmación.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
