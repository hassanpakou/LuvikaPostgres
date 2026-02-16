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


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://luvika.vercel.app'),
  title: { default: 'LUVIKA — Révèle qui tu es', template: '%s | LUVIKA' },
  description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements · Identité numérique africaine',
  keywords: ['carte visite numérique', 'NFC', 'QR code', 'identité numérique', 'réseau professionnel', 'Afrique', 'Kinshasa', 'LUVIKA'],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/lo.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements · Identité numérique africaine',
    url: 'https://luvika.vercel.app',
    siteName: 'LUVIKA',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/lo.png', width: 1200, height: 630, alt: 'LUVIKA - Votre identité numérique africaine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
    images: ['/lo.png'],
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
  verification: { google: 'your-google-verification-code' },
  alternates: {
    canonical: 'https://luvika.vercel.app',
    languages: { 'fr-FR': 'https://luvika.vercel.app/fr', 'en-US': 'https://luvika.vercel.app/en' },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      {/* 🔹 HEAD SANS COMMENTAIRES NI ESPACES EXTERNES */}
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/lo.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="LUVIKA" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#06b6d4" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" sizes="32x32" href="/lo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/lo.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="mask-icon" href="/icons/lo.png" color="#06b6d4" />
        <meta name="msapplication-TileColor" content="#06b6d4" />
        <meta name="msapplication-TileImage" content="/icons/lo.png" />
      </head>
      
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white relative overflow-x-hidden antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
              console.log('✅ Service Worker enregistré avec scope:', registration.scope);
              
              // 🔁 Mise à jour automatique quand une nouvelle version est disponible
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Afficher une notification de mise à jour
                    if (confirm('🆕 Nouvelle version de LUVIKA disponible ! Recharger pour mettre à jour ?')) {
                      window.location.reload();
                    }
                  }
                });
              });
            })
            .catch(error => {
              console.error('❌ Erreur enregistrement Service Worker:', error);
            });
        });
      }
    `
  }}
/>
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.performance?.getEntriesByType) {
            const paint = performance.getEntriesByType('paint');
            paint[0] && console.log('🎨 FP:', paint[0].startTime.toFixed(0)+'ms');
            paint[1] && console.log('🚀 FCP:', paint[1].startTime.toFixed(0)+'ms');
          }
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-speed', '0.01ms');
          }
        ` }} />
      </body>
      
      {/* 🔹 SCRIPTS APRÈS </body> - CORRECT */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-RYQBRH3CZC', {
          page_path: window.location.pathname,
          anonymize_ip: true,
          send_page_view: true
        });
      ` }} />
    </html>
  );
}