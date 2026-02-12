// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ThemeProvider } from 'next-themes'; // ✅ Ajouté
import BackgroundCyberpunk from '@/src/components/BackgroundCyberpunk';
import CRTOverlay from '@/src/components/CRTOverlay';
import Head from 'next/head';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        get: (name) => cookieStore.get(name)?.value 
      } 
    } // ✅ CORRIGÉ : 2 accolades fermantes seulement (pas 3)
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  return (
    <>
      <Head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RYQBRH3CZC');
            `
          }}
        />
      </Head>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        themes={['light', 'dark']}
      >
        <div className="relative min-h-screen bg-gradient-to-br text-white">
          <BackgroundCyberpunk />
          <CRTOverlay />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              {children}
            </div>
          </div>
          <div className="fixed bottom-4 left-4 z-50">
            <div className="glass-border rounded-lg p-3 border border-cyan-500/30 bg-gray-900 backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}
