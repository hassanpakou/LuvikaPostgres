// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ThemeProvider } from 'next-themes';
import BackgroundCyberpunk from '@/src/components/BackgroundCyberpunk';
import CRTOverlay from '@/src/components/CRTOverlay';

// 🔹 METADATA SPÉCIFIQUE AU DASHBOARD
export const metadata = {
  title: 'Tableau de bord • LUVIKA',
  description: 'Gérez votre identité numérique, vos cartes NFC, événements et statistiques',
};

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
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      themes={['light', 'dark']}
    >
      <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white">
        <BackgroundCyberpunk />
        <CRTOverlay />
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
            {children}
          </div>
        </div>
        
        {/* 🔹 Status system badge optimisé */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className="glass-border rounded-lg p-2.5 border border-cyan-500/20 bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
              <span className="text-gray-500">|</span>
              <span className="text-cyan-400/80">v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}