import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matri Cata&César',
  description: 'Acompáñanos en el viaje más importante de nuestras vidas. Cata & César · 26 de febrero de 2027.',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
