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

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // ✅ Meilleure performance de chargement
  adjustFontFallback: false,
});

// 🔹 METADATA CORRIGÉE (espaces supprimés + améliorations SEO)
export const metadata: Metadata = {
  metadataBase: new URL('https://luvika.vercel.app'), // ✅ ESPACES SUPPRIMÉS
  
  title: {
    default: 'LUVIKA — Révèle qui tu es',
    template: '%s | LUVIKA'
  },
  description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements · Identité numérique africaine',
  
  keywords: [
    'carte visite numérique', 'NFC', 'QR code', 'identité numérique', 
    'réseau professionnel', 'Afrique', 'Kinshasa', 'LUVIKA'
  ],

  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  openGraph: {
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements · Identité numérique africaine',
    url: 'https://luvika.vercel.app',
    siteName: 'LUVIKA',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LUVIKA - Votre identité numérique africaine',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
    images: ['/og-image.jpg'],
    creator: '@luvika',
  },
  
  // 🔹 Améliorations SEO critiques
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
    google: 'your-google-verification-code', // ✅ À remplacer
  },
  
  alternates: {
    canonical: 'https://luvika.vercel.app',
    languages: {
      'fr-FR': 'https://luvika.vercel.app/fr',
      'en-US': 'https://luvika.vercel.app/en',
      // ... autres locales
    },
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
    <html 
      lang={locale} 
      suppressHydrationWarning
      className="scroll-smooth" // ✅ Smooth scrolling natif
    >
      <head>
        {/* 🔹 Google Analytics - Version optimisée */}
        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC"
          strategy="afterInteractive"
        />
        <script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RYQBRH3CZC', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                send_page_view: true
              });
            `
          }}
        />
        
        {/* 🔹 PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LUVIKA" />
        <meta name="theme-color" content="#06b6d4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        
        {/* 🔹 Préchargement des ressources critiques */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 🔹 Favicon optimisé */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
        
        {/* 🔹 Script de performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if (window.performance && window.performance.getEntriesByType) {
                const paintEntries = performance.getEntriesByType('paint');
                if (paintEntries.length > 0) {
                  console.log('🎨 First Paint:', paintEntries[0].startTime.toFixed(2) + 'ms');
                  if (paintEntries[1]) {
                    console.log('🚀 First Contentful Paint:', paintEntries[1].startTime.toFixed(2) + 'ms');
                  }
                }
              }
              
              // Réduction des animations si préféré
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.style.setProperty('--animation-speed', '0.01ms');
              }
            `
          }}
        />
      </body>
    </html>
  );
}