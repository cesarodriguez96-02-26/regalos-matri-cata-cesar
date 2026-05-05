export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-2xl shadow-wine/10">
        <p className="text-5xl">💛</p>
        <h1 className="mt-4 font-serif text-5xl text-wine">¡Muchas gracias!</h1>
        <p className="mt-4 leading-7 text-ink/70">
          Si tu pago fue aprobado, recibirás un correo de confirmación. Tu regalo y mensaje quedarán guardados con mucho cariño para Catalina & César.
        </p>
        <a href="/" className="mt-8 inline-flex rounded-full bg-wine px-7 py-4 font-semibold text-white">Volver al inicio</a>
      </div>
    </main>
  );
}
