'use client';

import { GiftOption } from '@/config/gifts';
import { formatCLP } from '@/lib/format';

type Props = {
  gift: GiftOption;
  selected: boolean;
  onSelect: (gift: GiftOption) => void;
};

export function GiftCard({ gift, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(gift)}
      className={`group relative w-full overflow-hidden rounded-[1.6rem] border p-5 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft ${
        selected
          ? 'border-gold bg-white shadow-xl shadow-navy/10 ring-1 ring-gold/30'
          : 'border-navy/10 bg-white/80 shadow-sm hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-navy/8'
      }`}
    >
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gold/5" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-2xl ring-1 ring-gold/15" aria-hidden="true">
          {gift.emoji}
        </span>
        <span className="rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white">{formatCLP(gift.amount)}</span>
      </div>
      <h3 className="relative mt-5 font-serif text-2xl text-navy">{gift.title}</h3>
      <p className="relative mt-2 min-h-12 text-sm leading-6 text-ink/65">{gift.description}</p>
      <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold">
        {selected ? 'Regalo seleccionado ✓' : 'Elegir este regalo →'}
      </p>
    </button>
  );
}
