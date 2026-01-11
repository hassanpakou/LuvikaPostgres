// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

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
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}