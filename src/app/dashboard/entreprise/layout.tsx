// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminLayout({
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

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { data : profile } = await supabase
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single();

  // Autorise l'accès si Admin OU Plan Entreprise
  const isEnterprise = profile?.plan?.toLowerCase() === 'entreprise';
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin && !isEnterprise) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br">
      {/* Bouton retour */}
      <div className="w-full px-4 sm:px-8 pt-6 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Contenu */}
      <div className="w-full px-4 sm:px-8 py-4 text-white">
        {children}
      </div>
    </div>
  );
}