'use client';

import { GiftOption } from '@/config/gifts';
import { formatCLP } from '@/lib/format';

type Props = {
  gift: GiftOption;
  quantity: number;
  onChange: (quantity: number) => void;
};

export function GiftCard({ gift, quantity, onChange }: Props) {
  return (
    <article className={`group relative overflow-hidden rounded-[1.6rem] border p-5 transition ${quantity ? 'border-gold bg-white shadow-xl shadow-navy/10 ring-1 ring-gold/30' : 'border-navy/10 bg-white/80 shadow-sm hover:border-gold/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-2xl ring-1 ring-gold/15" aria-hidden="true">{gift.emoji}</span>
        <span className="rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white">{formatCLP(gift.amount)}</span>
      </div>
      <h3 className="mt-5 font-serif text-2xl text-navy">{gift.title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-ink/65">{gift.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.11em] text-gold">{quantity > 0 ? `${quantity} en tu selección` : 'Elige la cantidad'}</span>
        <div className="flex items-center overflow-hidden rounded-full border border-navy/15 bg-paper" aria-label={`Cantidad de ${gift.title}`}>
          <button type="button" onClick={() => onChange(Math.max(0, quantity - 1))} disabled={quantity === 0} aria-label={`Quitar una unidad de ${gift.title}`} className="px-3 py-2 text-lg font-bold text-navy disabled:opacity-30">−</button>
          <output className="min-w-6 text-center text-sm font-bold text-navy" aria-live="polite">{quantity}</output>
          <button type="button" onClick={() => onChange(Math.min(20, quantity + 1))} disabled={quantity >= 20} aria-label={`Agregar una unidad de ${gift.title}`} className="px-3 py-2 text-lg font-bold text-navy disabled:opacity-30">+</button>
        </div>
      </div>
    </article>
  );
}
