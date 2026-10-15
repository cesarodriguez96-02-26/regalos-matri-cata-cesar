import Image from 'next/image';
import { CheckoutForm } from '@/components/CheckoutForm';
import { WeddingCountdown } from '@/components/WeddingCountdown';
import { SectionNavigation } from '@/components/SectionNavigation';

// Iconos discretos para acompañar la estética de la invitación.
function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.3 11.7a8.3 8.3 0 0 1-12.4 7.2L3.5 20l1.1-4.2A8.3 8.3 0 1 1 20.3 11.7Z" />
      <path d="M9.1 8.2c.3-.2.7-.1.9.2l1.1 1.7-.7 1.1c.8 1.4 1.7 2.2 3.1 2.9l1.1-.7 1.8 1c.3.2.4.7.2 1-.5.9-1.5 1.2-2.5 1-3.2-.8-5.5-3-6.3-6.2-.3-1.1.2-1.7 1.3-2Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

// WhatsApp abre la aplicación instalada cuando el dispositivo lo permite.
// El mensaje queda redactado, pero el invitado debe enviarlo manualmente.
function whatsappConfirmationUrl(phone: string, contact: string) {
  const message = `¡Hola, ${contact}! 💛 Quiero confirmar asistencia al matrimonio de Cata y César del 26 de febrero de 2027. Nombre(s) de los invitados: ______. ¡Nos vemos para celebrar! 🥂`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

const itinerary = [
  { time: '18:00', event: 'Recepción', icon: '♡' },
  { time: '18:30', event: 'Ceremonia', icon: '💍' },
  { time: '19:00', event: 'Cóctel', icon: '🥂' },
  { time: '20:00', event: 'Cena', icon: '✧' },
  { time: '22:00', event: 'Fiesta', icon: '✦' },
  { time: '04:00', event: 'Fin', icon: '☾' }
];

const photos = [
  { src: '/photos/foto-1.jpg', alt: 'Cata y César compartiendo un recuerdo juntos', rotate: 'lg:-rotate-2' },
  { src: '/photos/foto-2.jpeg', alt: 'Cata y César viajando juntos', rotate: 'lg:translate-y-4' },
  { src: '/photos/foto-3.jpeg', alt: 'Cata y César celebrando su historia', rotate: 'lg:-translate-y-2' },
  { src: '/photos/foto-4.jpeg', alt: 'Un nuevo recuerdo de Cata y César', rotate: 'lg:rotate-1' },
  { src: '/photos/foto-5.jpeg', alt: 'Otro momento especial en la historia de Cata y César', rotate: 'lg:-rotate-1' },
  { src: '/photos/foto-6.jpeg', alt: 'Un recuerdo más del camino de Cata y César', rotate: 'lg:rotate-1' }
];

export default function Home() {
  return (
    <main className="overflow-hidden pt-16">
      <SectionNavigation />
      <section id="inicio" className="scroll-mt-20 px-5 pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-navy/70 sm:tracking-[0.28em]">
            <span>El viaje más importante de nuestras vidas</span>
            <span className="whitespace-nowrap text-gold">26 · 02 · 2027</span>
          </div>
          <div className="ticket-edge overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket">
            <div className="relative px-7 py-12 sm:px-12 md:px-16 md:py-16 lg:px-24 lg:py-20">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.055]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 25%, #0A3456 0 1px, transparent 1.5px), radial-gradient(circle at 70% 55%, #0A3456 0 1px, transparent 1.5px)',
                  backgroundSize: '52px 52px, 67px 67px'
                }}
              />
              <div className="pointer-events-none absolute left-3 top-5 rotate-[-18deg] font-serif text-5xl text-gold/15 sm:left-10 sm:top-12 sm:text-7xl" aria-hidden="true">♡</div>
              <div className="pointer-events-none absolute right-4 top-10 rotate-12 font-serif text-4xl text-gold/20 sm:right-14 sm:top-16 sm:text-6xl" aria-hidden="true">✧</div>
              <div className="pointer-events-none absolute bottom-6 left-8 rotate-12 font-serif text-5xl text-gold/15 sm:bottom-10 sm:left-20" aria-hidden="true">♡</div>
              <div className="pointer-events-none absolute bottom-12 right-5 rotate-[-20deg] text-4xl text-navy/10 sm:right-20" aria-hidden="true">✈</div>
              <div className="relative mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.42em] text-gold">Nos casamos</p>
                <h1 className="mt-5 font-serif text-5xl italic leading-tight text-navy sm:text-6xl md:text-7xl">
                  Cata &amp; César
                </h1>
                <div className="mx-auto mt-5 max-w-sm flight-line" aria-hidden="true" />
                <div className="mx-auto mt-5 max-w-[43rem] space-y-3 text-left text-base leading-6 text-ink/80 sm:text-center md:space-y-4 md:text-lg md:leading-7">
                  <p>Nuestra historia comenzó en <strong className="font-semibold text-navy">junio de 2022</strong>, cuando nuestros caminos se cruzaron casi sin aviso, pero con la sensación de que algo muy bonito estaba por comenzar.</p>
                  <p>Desde entonces, hemos crecido juntos, compartido risas, descubierto nuevos lugares y coleccionado recuerdos que nos acompañarán siempre. Entre viajes, aventuras y desafíos, descubrimos que lo más bonito de este camino es seguir eligiéndonos cada día.</p>
                  <p>Hoy estamos listos para iniciar el viaje más importante de nuestras vidas: <strong className="font-semibold text-navy">nuestro matrimonio</strong>. Y no imaginamos esta nueva aventura sin las personas que más queremos.</p>
                  <p>Por eso, nos haría muchísima ilusión que nos acompañaran a celebrar el amor, brindar por todo lo que viene y <span className="font-semibold text-navy">bailar juntos hasta que se acabe la noche</span>.</p>
                </div>
                <p className="mt-9 font-serif text-2xl italic text-gold">Con cariño, Cata &amp; César ♡</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recuerdos" className="scroll-mt-20 px-5 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Nuestra aventura hasta aquí</p>
            <h2 className="mt-3 font-serif text-4xl text-navy md:text-5xl">Algunos recuerdos de nuestro camino</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {photos.map((photo, index) => (
              <figure key={photo.src} className={`overflow-hidden rounded-[1.5rem] border border-navy/10 bg-white p-1.5 shadow-lg shadow-navy/5 sm:rounded-[1.75rem] sm:p-2 ${photo.rotate}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] sm:rounded-[1.35rem]">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1023px) 50vw, 33vw" className="object-cover" priority={index === 0} />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="invitacion" className="scroll-mt-20 px-5 py-14 md:py-20" aria-labelledby="proxima-aventura">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-9 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Tarjeta de embarque</p>
            <h2 id="proxima-aventura" className="mt-3 font-serif text-4xl text-navy md:text-5xl">Nuestra próxima aventura</h2>
            <p className="mt-4 text-base leading-7 text-ink/70">¡Lo importante es celebrar juntos! Aquí tienes todos los detalles para acompañarnos.</p>
          </div>
          <div className="ticket-edge overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket">
            <div className="grid gap-6 bg-navy px-6 py-8 text-white sm:grid-cols-3 sm:px-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">Fecha</p>
                <p className="mt-2 font-serif text-2xl">26 de febrero de 2027</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">Hora</p>
                <p className="mt-2 font-serif text-2xl">18:00 hrs</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">Lugar</p>
                <p className="mt-2 font-serif text-2xl">Santa Luz de Chicureo</p>
                <p className="mt-1 text-sm text-white/70">Chicureo, Colina, RM</p>
                <a href="https://maps.app.goo.gl/zP9kkZw38EqhYK6S6" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-soft/60 px-3 py-2 text-xs font-bold text-gold-soft transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft">
                  <MapPinIcon /> Ver ubicación en Google Maps ↗
                </a>
              </div>
            </div>
            <div className="px-6 py-10 sm:px-10">
              <h3 className="text-center font-serif text-2xl text-navy sm:text-3xl">Itinerario de nuestro gran día</h3>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {itinerary.map((step) => (
                  <div key={step.time} className="rounded-2xl border border-navy/10 bg-white p-4 text-center">
                    <span className="block text-2xl text-gold" aria-hidden="true">{step.icon}</span>
                    <p className="mt-3 text-sm font-bold text-navy">{step.time} hrs</p>
                    <p className="mt-1 text-sm text-ink/65">{step.event}</p>
                  </div>
                ))}
              </div>
              <div className="mt-9 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-gold/20 bg-paper p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Código de vestimenta</p>
                  <h3 className="mt-2 font-serif text-3xl text-navy">Formal</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/75">Para ellas, vestido largo. Para ellos, traje.</p>
                  <p className="mt-2 text-sm leading-7 text-ink/75">Evitar colores blanco, beige, crema y amarillo pastel.</p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-paper p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Una noche para adultos</p>
                  <h3 className="mt-2 font-serif text-2xl text-navy">Para los adultos, ¡una buena noche de fiesta!</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/75">Para los pequeños, unas dulces buenas noches. Con cariño, nuestra celebración será solo para adultos.</p>
                </div>
              </div>
              <div className="mt-9 border-t border-dashed border-navy/20 pt-8 text-center">
                <h3 className="font-serif text-2xl text-navy">Confirma tu asistencia</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">Avísanos por WhatsApp hasta el 20 de diciembre de 2026 para reservar tu lugar en este viaje.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <a href={whatsappConfirmationUrl("56987042305", "Cata")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-3 text-sm font-bold text-navy transition hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"><WhatsAppIcon /> Cata · +56 9 8704 2305</a>
                  <a href={whatsappConfirmationUrl("56976679136", "César")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-3 text-sm font-bold text-navy transition hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"><WhatsAppIcon /> César · +56 9 7667 9136</a>
                </div>
                <WeddingCountdown />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CheckoutForm />

      <footer className="px-5 pb-14 pt-6 text-center">
        <div className="mx-auto max-w-2xl border-t border-navy/10 pt-9">
          <p className="mt-3 font-serif text-3xl italic text-navy">Cata &amp; César</p>
          <p className="mt-3 text-sm leading-6 text-ink/60">26 de febrero de 2027</p>
        </div>
      </footer>
    </main>
  );
}
