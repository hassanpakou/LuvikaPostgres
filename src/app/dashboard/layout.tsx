// src/app/dashboard/layout.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Navbar from '@/components/layout/Navbar';
import BackgroundCyberpunk from '@/src/components/BackgroundCyberpunk';
import CRTOverlay from '@/src/components/CRTOverlay';
import PerformanceBadge from '@/src/components/PerformanceBadge';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* 🌌 Fond Cyberpunk (client-side uniquement) */}
      <BackgroundCyberpunk />
      
      {/* 📺 Effet CRT */}
      <CRTOverlay />

{/* 📊 Badge Performance */}
<PerformanceBadge />

      {/* 📱 Contenu Principal */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />
        
        {/* Contenu */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </div>
      </div>

      {/* 🎮 Badge Cyberpunk - SYSTEM ONLINE */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="glass-border rounded-lg p-3 border border-cyan-500/30 bg-black/50 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}