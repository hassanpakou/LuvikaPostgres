// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ClientProviders } from '@/src/components/system/ClientProviders';
import CookieBanner from '../components/layout/CookieBanner';
import InstallModal from '../components/layout/InstallModal';
import SessionGuard from '../components/SessionGuard';
import { SessionTimeoutProvider } from '../components/providers/SessionTimeoutProvider'; // ✅ IMPORT AJOUTÉ

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
        url: '/lo.jpeg',
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/lo.jpeg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LUVIKA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#06b6d4" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            {/* ✅ SESSION TIMEOUT PROVIDER AJOUTÉ ICI (wrapper global) */}
            <SessionTimeoutProvider>
              <SessionGuard>
                {children}
              </SessionGuard>
              <CookieBanner />
              <InstallModal />
            </SessionTimeoutProvider>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}