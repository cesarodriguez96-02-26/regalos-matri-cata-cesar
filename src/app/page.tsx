import { CheckoutForm } from '@/components/CheckoutForm';

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden px-5 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#E9C7C6_0,transparent_35%),radial-gradient(circle_at_bottom_right,#87967B55_0,transparent_30%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sage">26 de febrero</p>
            <h1 className="mt-5 font-serif text-6xl leading-tight text-wine md:text-7xl">Catalina & César</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">
              Estamos felices de comenzar esta nueva etapa y de compartirla con ustedes. Si desean hacernos un regalo, pueden elegir una experiencia simbólica para nuestra luna de miel y dejarnos un mensaje que guardaremos con mucho cariño.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#regalos" className="rounded-full bg-wine px-7 py-4 font-semibold text-white shadow-xl shadow-wine/20">Ver regalos</a>
              <a href="#fotos" className="rounded-full border border-wine/20 bg-white/70 px-7 py-4 font-semibold text-wine">Ver fotos</a>
            </div>
          </div>

          <div id="fotos" className="grid grid-cols-2 gap-4">
            <div className="h-72 rounded-[2rem] bg-white/60 p-3 shadow-xl shadow-wine/10 rotate-[-2deg]">
              <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-blush/45 text-center text-sm text-wine/70"><img src="/photos/foto-1.jpg" alt="Catalina y César" /></div>
            </div>
            <div className="mt-12 h-72 rounded-[2rem] bg-white/60 p-3 shadow-xl shadow-wine/10 rotate-[2deg]">
              <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-sage/25 text-center text-sm text-wine/70"><img src="/photos/foto-2.jpg" alt="Catalina y César 2" /></div>
            </div>
            <div className="col-span-2 h-56 rounded-[2rem] bg-white/60 p-3 shadow-xl shadow-wine/10">
              <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-wine/10 text-center text-sm text-wine/70">Foto horizontal destacada<br />/public/photos/foto-3.jpg</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Simple', 'Elige un regalo simbólico y deja tu mensaje.'],
            ['Seguro', 'El pago con tarjeta se realiza en el checkout de Flow.'],
            ['Con cariño', 'Cada mensaje quedará guardado para leerlo después.']
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-wine/10 bg-white/70 p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-wine">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <CheckoutForm transferDetails={[
        `Banco: ${process.env.TRANSFER_BANK ?? 'Banco por definir'}`,
        `Tipo: ${process.env.TRANSFER_ACCOUNT_TYPE ?? 'Cuenta por definir'}`,
        `Cuenta: ${process.env.TRANSFER_ACCOUNT_NUMBER ?? 'Número por definir'}`,
        `RUT: ${process.env.TRANSFER_RUT ?? 'RUT por definir'}`,
        `Nombre: ${process.env.TRANSFER_NAME ?? 'Catalina & César'}`,
        `Correo: ${process.env.TRANSFER_EMAIL ?? process.env.OWNER_EMAIL ?? 'correo por definir'}`
      ]} />

      <footer className="px-5 py-12 text-center text-sm text-ink/60">
        <p className="font-serif text-2xl text-wine">Catalina & César</p>
        <p className="mt-2">Gracias por ser parte de nuestra historia.</p>
      </footer>
    </main>
  );
}
