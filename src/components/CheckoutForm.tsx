'use client';

import { useMemo, useState } from 'react';
import { giftOptions } from '@/config/gifts';
import { GiftCard } from './GiftCard';
import { formatCLP } from '@/lib/format';

export function CheckoutForm() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [formStartedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = useMemo(() => giftOptions.filter((g) => (quantities[g.id] ?? 0) > 0).map((g) => ({
    ...g, quantity: quantities[g.id], subtotal: g.amount * quantities[g.id]
  })), [quantities]);
  const total = selected.reduce((sum, gift) => sum + gift.subtotal, 0);
  const units = selected.reduce((sum, gift) => sum + gift.quantity, 0);
  const valid = guestName.trim().length >= 3 && guestName.trim().length <= 120 && /^\S+@\S+\.\S+$/.test(guestEmail.trim());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!selected.length) { setError('Primero elige uno o más regalos usando los botones +.'); return; }
    if (!valid) { setError('Ingresa tu nombre y un correo válido.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selected.map(({ id, quantity }) => ({ giftId: id, quantity })),
          guestName, guestEmail, guestMessage, paymentMethod: 'flow', website, formStartedAt
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'No pudimos iniciar el pago.');
      if (typeof data.paymentUrl !== 'string') throw new Error('No se recibió el enlace seguro de pago.');
      window.location.assign(data.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setLoading(false);
    }
  }

  return (
    <section id="regalos" className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Nuestra lista de deseos</p>
          <h2 className="mt-3 font-serif text-4xl text-navy md:text-5xl">Gracias por ser parte de nuestra aventura</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/75">
            El regalo que más ilusión nos hace es compartir este día contigo. Si además quieres hacernos un obsequio simbólico para nuestro nuevo capítulo juntos, te dejamos nuestra lista de deseos.
          </p>
          <div className="mt-7 rounded-[1.75rem] border border-gold/25 bg-ivory p-5 text-left sm:p-7">
            <h3 className="text-center font-serif text-2xl text-navy">¿Cómo funciona?</h3>
            <ol className="mt-5 grid gap-3 text-sm leading-6 text-ink/75 sm:grid-cols-2">
              {[
                ['Paso 1', 'Elige uno o varios regalos y ajusta sus cantidades con los botones + y −.'],
                ['Paso 2', 'Revisa los regalos seleccionados y comprueba el monto total.'],
                ['Paso 3', 'Completa tu nombre, tu correo y, si quieres, déjanos un mensaje.'],
                ['Paso 4', 'Continúa al pago seguro para pagar con tarjeta de débito o crédito mediante Flow.']
              ].map(([step, description]) => (
                <li key={step} className="rounded-2xl border border-navy/10 bg-white/80 p-4">
                  <strong className="block text-xs uppercase tracking-[0.12em] text-gold">{step}</strong>
                  <p className="mt-2">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-white">1</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Paso 1</p>
            <h3 className="font-serif text-2xl text-navy sm:text-3xl">Elige tus regalos</h3>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/70">Puedes elegir uno o más regalos y sumar varias unidades de cada uno. Usa los botones + y − de las tarjetas.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {giftOptions.map((gift) => (
            <GiftCard key={gift.id} gift={gift} quantity={quantities[gift.id] ?? 0} onChange={(quantity) => setQuantities((prev) => ({ ...prev, [gift.id]: quantity }))} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="ticket-edge mt-12 overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket">
          <div className="bg-navy px-6 py-5 text-white md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">Paso 2 · Revisa tu selección</p>
            <h3 className="mt-1 font-serif text-2xl">Tu selección</h3>
            {selected.length === 0 ? <p className="mt-3 text-sm text-white/75">Todavía no has agregado regalos. Elige uno o varios arriba.</p> : (
              <ul className="mt-4 divide-y divide-white/15 text-sm">
                {selected.map((gift) => (
                  <li key={gift.id} className="flex items-start justify-between gap-3 py-2">
                    <span>{gift.quantity} × {gift.title}</span>
                    <strong className="whitespace-nowrap">{formatCLP(gift.subtotal)}</strong>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gold-soft/40 pt-4">
              <p className="text-sm">{units} {units === 1 ? 'regalo' : 'regalos'} en total</p>
              <p className="font-serif text-3xl">{formatCLP(total)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">3</span>
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Paso 3</p><h3 className="font-serif text-2xl text-navy">Completa tus datos</h3></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Nombre</span>
                  <input required autoComplete="name" maxLength={120} className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 outline-none focus:border-gold focus:ring-4 focus:ring-gold/10" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Arturo Vidal" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Correo</span>
                  <input required type="email" autoComplete="email" maxLength={180} className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 outline-none focus:border-gold focus:ring-4 focus:ring-gold/10" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="correo@ejemplo.cl" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-bold text-ink/70">Mensaje para Cata & César (opcional)</span>
                <textarea maxLength={1200} className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3.5 outline-none focus:border-gold focus:ring-4 focus:ring-gold/10" value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Déjanos unas palabras para guardar junto a este recuerdo..." />
                <span className="mt-1 block text-right text-xs text-ink/40">{guestMessage.length}/1200</span>
              </label>
              <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><label>Sitio web<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
            </div>
            <div className="border-t border-dashed border-navy/15 bg-paper/70 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">4</span>
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Paso 4</p><h3 className="font-serif text-2xl text-navy">Continúa al pago seguro</h3></div>
              </div>
              <div className="mt-6 rounded-2xl border border-gold/30 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><strong className="text-navy">Tarjeta de débito o crédito</strong><p className="mt-2 text-sm leading-6 text-ink/65">Al continuar, irás a la plataforma segura de Flow para completar un único pago por todos tus regalos. Nunca recibimos ni guardamos los datos de tu tarjeta.</p></div>
                  <span className="text-2xl" aria-hidden="true">💳</span>
                </div>
              </div>
              <div aria-live="polite">{error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}</div>
              <button disabled={loading || selected.length === 0} className="mt-5 w-full rounded-full bg-navy px-6 py-4 font-bold text-white shadow-lg shadow-navy/15 transition hover:bg-navy-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Preparando pago seguro...' : `Continuar al pago seguro · ${formatCLP(total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-ink/50">Después podrás elegir débito o crédito en Flow. Recibirás una confirmación al completarse el pago.</p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
