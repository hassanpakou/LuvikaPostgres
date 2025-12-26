// src/app/(admin)/admin/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import AdminActions from '@/components/admin/AdminActions';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // ✅ Déstructuration CORRECTE + typage implicite
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  // ✅ Vérifie l'erreur ET l'absence d'utilisateur
  if (userError || !user) {
    redirect('/auth/sign-in');
  }

  // ✅ Récupère le rôle dans profiles (sécurisé)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const profile = profileData;

  if (profileError || profile?.role !== 'admin') {
    redirect('/');
  }

  const t = await getTranslations();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
          {t('admin.title')}
        </h1>
        <p className="text-gray-400 mt-2">
          {t('admin.subtitle')}
        </p>
      </div>
      
      <AdminActions />
    </div>
  );
}