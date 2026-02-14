// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ✅ SERVER COMPONENT PUR - PAS DE 'use client' NI D'IMPORTS CLIENT
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const code = searchParams.code || searchParams.token_hash;
  const next = (Array.isArray(searchParams.next) ? searchParams.next[0] : searchParams.next) || '/complete-profile';
  const plan = (Array.isArray(searchParams.plan) ? searchParams.plan[0] : searchParams.plan) || 'basic';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code as string);
    if (error) {
      console.error('Erreur vérification code:', error);
      redirect(`/auth/error?message=${encodeURIComponent(error.message || 'Erreur lors de la vérification')}`);
    }

    cookieStore.set('signup_plan', plan, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    redirect(next);
  }

  // ✅ REDIRECTION PAR DÉFAUT SI PAS DE CODE
  redirect('/auth/sign-in');
}