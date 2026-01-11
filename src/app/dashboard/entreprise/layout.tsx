// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
    console.warn('🚫 Accès Layout Entreprise refusé:', { role: profile?.role, plan: profile?.plan });
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
}