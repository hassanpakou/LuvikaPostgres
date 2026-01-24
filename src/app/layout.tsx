// src/app/layout.tsx
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

// ✅ Liste des routes publiques (sans auth)
const PUBLIC_ROUTES = [
  '/auth',
  '/privacy',
  '/terms',
  '/cookies',
  '/blog',
  '/fr', // Page d'accueil
  '/en',
  '/ln',
  '/kg',
  '/sw',
  '/pt',
  '/nl',
  '/es',
  '/ar',
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // ✅ Vérifie si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    typeof window !== 'undefined' ? 
      window.location.pathname.startsWith(route) : 
      true // Par défaut, considère comme protégé côté serveur
  );

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            {/* ✅ N'applique SessionGuard QUE sur les routes protégées */}
            {isPublicRoute ? children : <SessionGuard>{children}</SessionGuard>}
            <CookieBanner />
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}