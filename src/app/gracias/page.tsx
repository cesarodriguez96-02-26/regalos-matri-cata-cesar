type GraciasPageProps = {
  searchParams?: Promise<{ status?: string | string[] }>;
};

const contentByStatus = {
  paid: {
    icon: '♥',
    eyebrow: 'Regalo confirmado',
    title: '¡Muchas gracias!',
    message: 'Tu pago fue aprobado correctamente. Guardaremos tu regalo y tu mensaje como parte de esta aventura que estamos comenzando.',
    buttonText: 'Volver a nuestra lista'
  },
  failed: {
    icon: '↻',
    eyebrow: 'Pago no completado',
    title: 'No se pudo completar el pago',
    message: 'El pago fue rechazado, anulado o no logró finalizar. Puedes volver a intentarlo sin que el intento anterior quede registrado como pagado.',
    buttonText: 'Intentarlo nuevamente'
  },
  pending: {
    icon: '…',
    eyebrow: 'Validando con Flow',
    title: 'Estamos revisando tu pago',
    message: 'Flow aún no informa un resultado final. Si el pago fue aprobado, la confirmación llegará cuando el sistema termine de procesarlo.',
    buttonText: 'Volver al inicio'
  },
  error: {
    icon: '!',
    eyebrow: 'No pudimos validar',
    title: 'No pudimos confirmar el pago',
    message: 'Si el cobro aparece en tu banco, no vuelvas a pagar de inmediato. Contáctanos y lo revisaremos antes de hacer un segundo intento.',
    buttonText: 'Volver al inicio'
  },
  not_found: {
    icon: '?',
    eyebrow: 'Orden no encontrada',
    title: 'No encontramos la orden',
    message: 'No pudimos asociar la respuesta con un regalo guardado. Si ves un cobro en tu banco, contáctanos para revisarlo.',
    buttonText: 'Volver al inicio'
  }
};

export default async function GraciasPage({ searchParams }: GraciasPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawStatus = resolvedSearchParams?.status;
  const status = Array.isArray(rawStatus) ? rawStatus[0] ?? 'pending' : rawStatus ?? 'pending';
  const content = contentByStatus[status as keyof typeof contentByStatus] ?? contentByStatus.pending;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="ticket-edge w-full max-w-xl overflow-hidden rounded-[2rem] border border-navy/10 bg-ivory shadow-ticket">
        <div className="bg-navy px-7 py-5 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-soft">Cata & César · 26.02.2027</p>
        </div>
        <div className="p-8 text-center md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper font-serif text-3xl text-gold ring-1 ring-gold/20">{content.icon}</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-gold">{content.eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl text-navy md:text-5xl">{content.title}</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-ink/68">{content.message}</p>
          <div className="mx-auto mt-6 max-w-xs flight-line" aria-hidden="true" />
          <a href="/" className="mt-7 inline-flex rounded-full bg-navy px-7 py-3.5 font-bold text-white transition hover:bg-navy-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-soft">
            {content.buttonText}
          </a>
        </div>
      </section>
    </main>
  );
}
