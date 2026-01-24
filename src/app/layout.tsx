import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ClientProviders } from '@/src/components/system/ClientProviders';
import CookieBanner from '../components/layout/CookieBanner';
import SessionGuard from '../components/SessionGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LUVIKA — Révèle qui tu es',
  description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
  icons: { icon: '/favicon.ico' },
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
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}