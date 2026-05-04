import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regalos para Catalina & César',
  description: 'Mesa de regalos simbólicos para Catalina & César'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
