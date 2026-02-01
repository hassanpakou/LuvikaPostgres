import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ClientProviders } from '@/src/components/system/ClientProviders';
import CookieBanner from '../components/layout/CookieBanner';
import InstallModal from '../components/layout/InstallModal';
import SessionGuard from '../components/SessionGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://luvika.vercel.app'),

  title: 'LUVIKA — Révèle qui tu es',
  description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',

  icons: {
    icon: '/favicon.ico',
  },

  openGraph: {
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
    url: 'https://luvika.vercel.app',
    siteName: 'Luvika',
    images: [
      {
        url: '/lo.jpeg',   // ton image
        width: 1200,
        height: 630,
        alt: 'Logo Luvika',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
    images: ['/lo.jpeg'],
  },
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            <SessionGuard>
              {children}
            </SessionGuard>
            <CookieBanner />
            <InstallModal />
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
