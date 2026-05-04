'use client';

import { useMemo, useRef, useState } from 'react';
import { GiftOption, giftOptions } from '@/config/gifts';
import { GiftCard } from './GiftCard';
import { formatCLP } from '@/lib/format';

type CheckoutMode = 'flow' | 'transfer';

export function CheckoutForm({ transferDetails }: { transferDetails: string[] }) {
  const [selected, setSelected] = useState<GiftOption>(giftOptions[0]);
  const [mode, setMode] = useState<CheckoutMode>('flow');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferSaved, setTransferSaved] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleGiftSelect(gift: GiftOption) {
    setSelected(gift);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  const isValid = useMemo(() => guestName.trim().length >= 3 && /\S+@\S+\.\S+/.test(guestEmail), [guestName, guestEmail]);

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
          paymentMethod: mode
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'No se pudo iniciar el pago.');

      if (mode === 'flow') {
        window.location.href = data.paymentUrl;
      } else {
        setTransferSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="regalos" className="mx-auto max-w-6xl px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sage">Mesa de regalos</p>
        <h2 className="mt-3 font-serif text-4xl text-wine md:text-5xl">Regalos simbólicos</h2>
        <p className="mt-4 text-ink/70">Elige una experiencia simbólica. Cada aporte nos ayudará a construir recuerdos en esta nueva etapa.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {giftOptions.map((gift) => (
          <GiftCard key={gift.id} gift={gift} selected={gift.id === selected.id} onSelect={handleGiftSelect} />
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="scroll-mt-6 mt-10 rounded-[2rem] bg-white p-6 shadow-2xl shadow-wine/10 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h3 className="font-serif text-3xl text-wine">Tu regalo seleccionado</h3>
            <div className="mt-4 rounded-3xl border border-wine/10 bg-cream p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl">{selected.emoji}</p>
                  <p className="mt-2 font-serif text-2xl text-wine">{selected.title}</p>
                  <p className="mt-1 text-sm text-ink/65">{selected.description}</p>
                </div>
                <p className="text-xl font-bold text-wine">{formatCLP(selected.amount)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink/70">Nombre</span>
                <input className="mt-2 w-full rounded-2xl border border-wine/10 bg-white px-4 py-3 outline-none ring-wine/20 focus:ring-4" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej: María González" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink/70">Correo</span>
                <input className="mt-2 w-full rounded-2xl border border-wine/10 bg-white px-4 py-3 outline-none ring-wine/20 focus:ring-4" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="correo@ejemplo.cl" type="email" />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink/70">Mensaje para Catalina & César</span>
              <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-wine/10 bg-white px-4 py-3 outline-none ring-wine/20 focus:ring-4" value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Déjanos un mensaje bonito..." />
            </label>
          </div>

          <div className="rounded-3xl border border-wine/10 bg-cream p-5">
            <h4 className="font-serif text-2xl text-wine">Forma de pago</h4>
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => setMode('flow')} className={`rounded-2xl border p-4 text-left ${mode === 'flow' ? 'border-wine bg-white ring-2 ring-wine/15' : 'border-wine/10 bg-white/60'}`}>
                <strong>Tarjeta débito / crédito</strong>
                <span className="mt-1 block text-sm text-ink/65">Pago seguro por Flow. El invitado será redirigido al checkout.</span>
              </button>
              <button type="button" onClick={() => setMode('transfer')} className={`rounded-2xl border p-4 text-left ${mode === 'transfer' ? 'border-wine bg-white ring-2 ring-wine/15' : 'border-wine/10 bg-white/60'}`}>
                <strong>Transferencia</strong>
                <span className="mt-1 block text-sm text-ink/65">Opción alternativa. Queda registrada como pendiente de confirmación.</span>
              </button>
            </div>

            {mode === 'transfer' && (
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-ink/70">
                <p className="font-semibold text-wine">Datos de transferencia</p>
                {transferDetails.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="mt-2 text-xs">Luego de transferir, presiona “Registrar regalo por transferencia”.</p>
              </div>
            )}

            {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {transferSaved && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm text-green-700">¡Gracias! Tu intención de regalo quedó registrada. Catalina & César confirmarán la transferencia.</p>}

            <button disabled={loading} className="mt-5 w-full rounded-full bg-wine px-6 py-4 font-semibold text-white shadow-lg shadow-wine/20 transition hover:bg-wine/90 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Procesando...' : mode === 'flow' ? 'Pagar regalo con tarjeta' : 'Registrar regalo por transferencia'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
