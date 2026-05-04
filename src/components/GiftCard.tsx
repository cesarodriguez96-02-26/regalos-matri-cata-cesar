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
      onClick={() => onSelect(gift)}
      className={`group text-left rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl ${
        selected ? 'border-wine bg-white shadow-xl ring-2 ring-wine/20' : 'border-wine/10 bg-white/75 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-4xl">{gift.emoji}</span>
        <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-wine">{formatCLP(gift.amount)}</span>
      </div>
      <h3 className="mt-4 font-serif text-2xl text-wine">{gift.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{gift.description}</p>
      <p className="mt-4 text-sm font-semibold text-sage group-hover:text-wine">Seleccionar regalo →</p>
    </button>
  );
}
