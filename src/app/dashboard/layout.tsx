// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white">
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}