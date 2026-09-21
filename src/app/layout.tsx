import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regalos para Cata & César',
  description: 'Lista de regalos simbólicos para acompañar la próxima aventura de Cata & César.',
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
