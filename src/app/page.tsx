import Image from 'next/image';
import { CheckoutForm } from '@/components/CheckoutForm';

const transferDetails = [
  { label: 'Banco', value: process.env.TRANSFER_BANK ?? 'Banco por definir' },
  { label: 'Tipo de cuenta', value: process.env.TRANSFER_ACCOUNT_TYPE ?? 'Cuenta por definir' },
  { label: 'N° de cuenta', value: process.env.TRANSFER_ACCOUNT_NUMBER ?? 'Número por definir' },
  { label: 'RUT', value: process.env.TRANSFER_RUT ?? 'RUT por definir' },
  { label: 'Titular', value: process.env.TRANSFER_NAME ?? 'Cata & César' },
  { label: 'Correo', value: process.env.TRANSFER_EMAIL ?? process.env.OWNER_EMAIL ?? 'correo por definir' }
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="px-5 pb-14 pt-8 md:pb-20 md:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.28em] text-navy/70">
            <span>Tarjeta de embarque · Cata & César</span>
            <span className="hidden sm:inline">26 · 02 · 2027</span>
          </div>

          <div className="ticket-edge overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket">
            <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
              <div className="relative px-7 py-10 sm:px-10 md:py-14 lg:px-14">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.055]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 25%, #0A3456 0 1px, transparent 1.5px), radial-gradient(circle at 70% 55%, #0A3456 0 1px, transparent 1.5px)',
                    backgroundSize: '52px 52px, 67px 67px'
                  }}
                />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.42em] text-gold">Nos casamos</p>
                  <h1 className="mt-4 font-serif text-5xl italic leading-none text-navy sm:text-6xl md:text-7xl">
                    Cata & César
                  </h1>
                  <div className="mt-6 max-w-xl flight-line" aria-hidden="true" />
                  <p className="mt-6 max-w-2xl text-base leading-7 text-ink/75 md:text-lg md:leading-8">
                    Tu presencia es nuestro mejor regalo. Pero si quieres darnos un obsequio para nuestra próxima aventura,
                    preparamos esta lista de regalos simbólicos para que elijas el recuerdo que quieras acompañar.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="#regalos"
                      className="rounded-full bg-navy px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-navy-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft"
                    >
                      Ver lista de regalos
                    </a>
                    <a
                      href="#nuestra-aventura"
                      className="rounded-full border border-navy/15 bg-white px-6 py-3.5 text-sm font-bold text-navy transition hover:border-gold/40 hover:bg-paper focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft"
                    >
                      Nuestra aventura
                    </a>
                  </div>
                </div>
              </div>

              <aside className="relative border-t border-dashed border-navy/20 bg-navy px-7 py-9 text-white lg:border-l lg:border-t-0 sm:px-9">
                <div className="absolute right-6 top-5 text-3xl text-gold-soft" aria-hidden="true">✈</div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-soft">Nuestro matrimonio</p>
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Destino</p>
                    <p className="mt-1 font-serif text-3xl">Una vida juntos</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5 border-y border-white/15 py-5 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Fecha</p>
                      <p className="mt-1 font-bold">26 FEB 2027</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Lugar</p>
                      <p className="mt-1 font-bold">Chicureo</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Clase</p>
                      <p className="mt-1 font-bold">Primera clase</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Equipaje</p>
                      <p className="mt-1 font-bold">Muchas ganas</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="nuestra-aventura" className="px-5 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Nuestra aventura hasta aquí</p>
            <h2 className="mt-3 font-serif text-4xl text-navy md:text-5xl">Algunos recuerdos antes del gran viaje</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <figure className="overflow-hidden rounded-[1.75rem] border border-navy/10 bg-white p-2 shadow-lg shadow-navy/5 md:-rotate-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
                <Image src="/photos/foto-1.jpg" alt="Cata y César compartiendo un recuerdo juntos" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority />
              </div>
            </figure>
            <figure className="overflow-hidden rounded-[1.75rem] border border-navy/10 bg-white p-2 shadow-lg shadow-navy/5 md:translate-y-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
                <Image src="/photos/foto-2.jpeg" alt="Cata y César durante uno de sus viajes" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            </figure>
            <figure className="overflow-hidden rounded-[1.75rem] border border-navy/10 bg-white p-2 shadow-lg shadow-navy/5 md:rotate-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
                <Image src="/photos/foto-3.jpeg" alt="Cata y César celebrando su historia juntos" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            </figure>
          </div>
        </div>
      </section>

      <CheckoutForm transferDetails={transferDetails} />

      <footer className="px-5 pb-14 pt-6 text-center">
        <div className="mx-auto max-w-2xl border-t border-navy/10 pt-9">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Gracias por ser parte de nuestra aventura</p>
          <p className="mt-3 font-serif text-3xl italic text-navy">Cata & César</p>
          <p className="mt-3 text-sm leading-6 text-ink/60">26 de febrero de 2027 · Santa Luz de Chicureo</p>
        </div>
      </footer>
    </main>
  );
}
