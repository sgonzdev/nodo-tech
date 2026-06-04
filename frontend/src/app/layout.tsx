import type { Metadata } from 'next';
import { Spectral, Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

const serif = Spectral({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-serif',
});
const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'NodoTech · Análisis de Marketing',
  description:
    'ROAS reconciliado contra ventas reales con atribución multi-touch',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
