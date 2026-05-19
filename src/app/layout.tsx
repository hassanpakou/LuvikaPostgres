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
import { SessionTimeoutProvider } from '../components/providers/SessionTimeoutProvider';
import { ReviewPrompt } from '../components/system/ReviewPrompt';
import Script from 'next/script';
import SplashScreen from '../components/ui/SplashScreen';


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://luvika.vercel.app'),

  title: {
    default: 'LUVIKA — Révèle qui tu es',
    template: '%s | LUVIKA',
  },

  description:
    'Carte de visite intelligente NFC, QR Code, abonnements et identité numérique africaine.',

  applicationName: 'LUVIKA',

  keywords: [
    'carte visite numérique',
    'NFC',
    'QR code',
    'identité numérique',
    'réseau professionnel',
    'Afrique',
    'LUVIKA',
  ],

  authors: [{ name: 'LUVIKA Team' }],
  creator: 'LUVIKA',

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  openGraph: {
    type: 'website',
    url: 'https://luvika.vercel.app',
    title: 'LUVIKA — Révèle qui tu es',
    description:
      'Carte de visite intelligente NFC, QR Code et identité numérique africaine.',
    siteName: 'LUVIKA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LUVIKA',
      },
    ],
    locale: 'fr_FR',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LUVIKA — Révèle qui tu es',
    description:
      'Carte de visite intelligente NFC, QR Code et identité numérique africaine.',
    images: ['/og-image.png'],
    creator: '@luvika',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: 'StrToXBAcUOqWud04cCkAjsXw8jWQEHe8BluylfOEAU',
  },

  alternates: {
    canonical: 'https://luvika.vercel.app',
    languages: {
      'fr-FR': 'https://luvika.vercel.app/fr',
      'en-US': 'https://luvika.vercel.app/en',
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">

      <body className={`${inter.className} min-h-screen bg-slate-950 text-white relative overflow-x-hidden antialiased`}>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <SplashScreen />
          <ClientProviders>
            <SessionTimeoutProvider>
              <SessionGuard>
                {children}
                <ReviewPrompt />
              </SessionGuard>

              <CookieBanner />
              <InstallModal />
            </SessionTimeoutProvider>
          </ClientProviders>
        </NextIntlClientProvider>

        {/* SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(registration => {
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker?.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (confirm('Nouvelle version disponible. Recharger ?')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    });
                });
              }
            `
          }}
        />

        {/* PERFORMANCE OPTIMIZATIONS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.performance?.getEntriesByType) {
                const paint = performance.getEntriesByType('paint');
                console.log('FP:', paint[0]?.startTime);
                console.log('FCP:', paint[1]?.startTime);
              }

              if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.style.setProperty('--animation-speed', '0.01ms');
              }
            `
          }}
        />

        {/* GOOGLE ANALYTICS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC"
          strategy="afterInteractive"
        />

        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RYQBRH3CZC', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `
          }}
        />

      </body>
    </html>
  );
}
