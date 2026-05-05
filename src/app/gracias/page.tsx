type GraciasPageProps = {
  searchParams?: {
    status?: string;
  };
};

const contentByStatus = {
  paid: {
    emoji: '💛',
    title: '¡Muchas gracias!',
    message:
      'Tu pago fue aprobado correctamente. Recibirás un correo de confirmación y guardaremos tu regalo y mensaje con mucho cariño para Catalina & César.',
    buttonText: 'Volver al inicio'
  },
  failed: {
    emoji: '🤍',
    title: 'No se pudo completar el pago',
    message:
      'Al parecer el pago fue rechazado, anulado o no pudo finalizarse correctamente. Puedes intentarlo nuevamente eligiendo el mismo regalo u otro regalo simbólico.',
    buttonText: 'Intentarlo nuevamente'
  },
  pending: {
    emoji: '⏳',
    title: 'Estamos revisando tu pago',
    message:
      'Flow aún no confirma el resultado final del pago. Si fue aprobado, recibirás el correo de confirmación cuando el sistema termine de procesarlo.',
    buttonText: 'Volver al inicio'
  },
  error: {
    emoji: '🤍',
    title: 'No pudimos confirmar el pago',
    message:
      'Ocurrió un problema al consultar el estado del pago. Si el cobro aparece en tu banco, no vuelvas a pagar de inmediato y contáctanos para revisarlo.',
    buttonText: 'Volver al inicio'
  },
  not_found: {
    emoji: '🤍',
    title: 'No encontramos la orden',
    message:
      'No pudimos asociar la respuesta de Flow con una orden guardada. Si el cobro aparece en tu banco, contáctanos para revisarlo.',
    buttonText: 'Volver al inicio'
  }
};

export default function GraciasPage({ searchParams }: GraciasPageProps) {
  const status = searchParams?.status ?? 'pending';
  const content = contentByStatus[status as keyof typeof contentByStatus] ?? contentByStatus.pending;
  const isFailed = status === 'failed';

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-2xl shadow-wine/10">
        <p className="text-5xl">{content.emoji}</p>
        <h1 className="mt-4 font-serif text-5xl text-wine">{content.title}</h1>
        <p className="mt-4 leading-7 text-ink/70">{content.message}</p>

        {isFailed && (
          <p className="mt-4 rounded-2xl bg-blush/40 px-4 py-3 text-sm leading-6 text-wine">
            No se registró como regalo pagado. Puedes volver al inicio y reintentar el pago.
          </p>
        )}

        <a href="/" className="mt-8 inline-flex rounded-full bg-wine px-7 py-4 font-semibold text-white">
          {content.buttonText}
        </a>
      </div>
    </main>
  );
}
