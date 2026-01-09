// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale, getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LUVIKA — Révèle qui tu es',
  description: 'Carte de visite intelligente NFC · QR Code · Abonnements · Événements',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('footer');

  // 🔹 ✅ Gestion sécurisée de l'auth dans layout
  let user = null;
  try {
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // ✅ Utilise getUser() — mais ignore les erreurs
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (!error && authUser) {
      user = authUser;
    }
  } catch (err) {
    // Silently ignore — layout must render for everyone
    console.debug('ℹ️ No active session in layout (normal for public pages)');
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* ✅ Ajout de suppressHydrationWarning sur <body> */}
      <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Fond animé */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 animate-float" />
              <div className="absolute top-2/3 right-1/3 w-80 h-80 rounded-full bg-cyan-400/5 animate-float" style={{ animationDelay: '1.2s' }} />
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-indigo-500/5 animate-float" style={{ animationDelay: '0.8s' }} />
            </div>
          </div>

          <Navbar />
          <main className="container mx-auto px-4 py-3 max-w-6xl">
            {children}
          </main>
          
          <Footer
            product={t('product')}
            features={t('features')}
            pricing={t('pricing')}
            download={t('download')}
            company={t('company')}
            about={t('about')}
            contact={t('contact')}
            blog={t('blog')}
            legal={t('legal')}
            privacy={t('privacy')}
            terms={t('terms')}
            cookies={t('cookies')}
            tagline={t('tagline')}
            copyright={t('copyright')}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}