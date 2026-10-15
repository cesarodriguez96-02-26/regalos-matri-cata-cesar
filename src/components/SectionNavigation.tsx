'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'inicio', label: 'Cata & César' },
  { id: 'recuerdos', label: 'Recuerdos' },
  { id: 'invitacion', label: 'Invitación' },
  { id: 'regalos', label: 'Lista de deseos' }
] as const;

type SectionId = (typeof sections)[number]['id'];

export function SectionNavigation() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      // La sección se considera activa cuando llega bajo el encabezado fijo.
      const offset = 110;
      let current: SectionId = 'inicio';

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }

      setActiveSection((previous) => previous === current ? previous : current);
    };

    const onScrollOrResize = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-navy/10 bg-ivory/95 shadow-sm shadow-navy/5 backdrop-blur-lg">
      <nav aria-label="Secciones de nuestra página" className="mx-auto flex h-16 max-w-6xl items-center px-3 sm:px-5">
        <div className="section-nav-scroll w-full overflow-x-auto overscroll-x-contain">
          <div className="mx-auto flex w-max min-w-full items-center justify-center gap-1 sm:gap-3">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={activeSection === id ? 'location' : undefined}
                className={`whitespace-nowrap rounded-full px-2.5 py-2.5 text-[11px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-5 sm:py-3 sm:text-sm ${
                  activeSection === id
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-navy/70 hover:bg-paper hover:text-navy'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
