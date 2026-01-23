// src/app/[locale]/layout.tsx
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import { ClientProviders } from '@/src/components/system/ClientProviders';
import Footer from '../../components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

// Type union littéral pour les locales supportées
const supportedLocales = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
type SupportedLocale = typeof supportedLocales[number];

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const checkedLocale = locale as SupportedLocale;
  setRequestLocale(checkedLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={checkedLocale} messages={messages}>
      <div className={inter.className + " min-h-screen flex flex-col"}>
        {/* Navbar */}
        <Navbar />

        {/* Contenu principal */}
        <ClientProviders>
          <main className="flex-1">
            {children}
          </main>
        </ClientProviders>

        {/* Footer complet */}
        <Footer
          product="Produit"
          features="Fonctionnalités"
          pricing="Tarifs"
          download="Téléchargement"
          company="Entreprise"
          about="À propos"
          contact="Contact"
          blog="Blog"
          legal="Légal"
          privacy="Privacy"
          terms="Terms"
          cookies="Cookies"
          tagline="Découvrez Luvika, votre solution digitale à Kinshasa et au-delà."
          copyright="Tous droits réservés."
        />
      </div>
    </NextIntlClientProvider>
  );
}
