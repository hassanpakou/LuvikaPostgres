// src/app/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { HomePageContent } from '@/src/components/home/HomePageContent';

export default async function HomePage() {
  // 🔹 1. Initialisation Supabase SSR
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
      },
    }
  );

  // 🔹 2. Redirection si connecté
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || 'user';
    redirect(role === 'admin' ? '/admin' : '/dashboard');
  }

  // 🔹 3. Affichage landing pour public
  return <HomePageContent />;
}