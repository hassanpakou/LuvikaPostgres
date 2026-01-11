import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Navbar from '@/components/layout/Navbar';

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
    <div className="min-h-screen text-white">
      {/* Navbar dédiée Dashboard (on peut réutiliser la Navbar ou en faire une custom) */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Ici on pourrait ajouter la barre de progression globale du profil */}
        {children}
      </div>
    </div>
  );
}