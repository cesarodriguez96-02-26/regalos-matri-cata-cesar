'use client';

import { useEffect, useState } from 'react';

// El 26 de febrero Chile continental se encuentra en horario de verano (UTC−03:00).
// El offset explícito mantiene la misma hora de inicio para invitados en cualquier país.
const WEDDING_DATE = new Date('2027-02-26T18:00:00-03:00').getTime();

function getTimeRemaining(now: number) {
  const difference = Math.max(0, WEDDING_DATE - now);
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference % 86_400_000) / 3_600_000),
    minutes: Math.floor((difference % 3_600_000) / 60_000),
    seconds: Math.floor((difference % 60_000) / 1_000),
    finished: difference === 0
  };
}

export function WeddingCountdown() {
  // Mantener el primer render igual entre servidor y cliente evita errores de hidratación.
  const [remaining, setRemaining] = useState<ReturnType<typeof getTimeRemaining> | null>(null);

  useEffect(() => {
    const update = () => setRemaining(getTimeRemaining(Date.now()));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const values = [
    { label: 'Días', value: remaining?.days },
    { label: 'Horas', value: remaining?.hours },
    { label: 'Minutos', value: remaining?.minutes },
    { label: 'Segundos', value: remaining?.seconds }
  ];

  return (
    <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-gold/25 bg-paper px-4 py-8 text-center sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute left-5 top-4 font-serif text-4xl text-gold/15" aria-hidden="true">♡</div>
      <div className="pointer-events-none absolute bottom-3 right-6 font-serif text-5xl text-gold/15" aria-hidden="true">✧</div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Cada segundo cuenta ♡</p>
      <h3 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">¡Ya falta menos para nuestro gran día!</h3>
      <p className="mt-2 text-sm text-ink/60">
        <time dateTime="2027-02-26T18:00:00-03:00">26 de febrero de 2027 · 18:00 hrs (Chile)</time>
      </p>

      {remaining?.finished ? (
        <p role="status" className="relative mt-7 font-serif text-2xl italic text-navy sm:text-3xl">
          ¡Llegó el gran día! 💛
        </p>
      ) : (
        <div className="relative mx-auto mt-7 grid max-w-xl grid-cols-4 gap-2 sm:gap-4" role="timer" aria-label="Tiempo restante para el matrimonio" aria-live="off">
          {values.map(({ label, value }) => (
            <div key={label} className="min-w-0 rounded-2xl border border-gold/15 bg-white px-1 py-4 shadow-sm sm:px-4 sm:py-5">
              <span className="block font-serif text-3xl font-bold tabular-nums text-navy sm:text-4xl md:text-5xl">
                {value === undefined ? '--' : String(value).padStart(2, '0')}
              </span>
              <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60 sm:text-xs sm:tracking-[0.15em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
