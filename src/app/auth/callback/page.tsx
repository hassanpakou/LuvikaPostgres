// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

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
  // ✅ Correction 1 : force next en string
  const next = (Array.isArray(searchParams.next) ? searchParams.next[0] : searchParams.next) || '/complete-profile';
  // ✅ Correction 2 : force plan en string
  const plan = (Array.isArray(searchParams.plan) ? searchParams.plan[0] : searchParams.plan) || 'basic';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code as string);
    if (error) {
      console.error('Erreur vérification code:', error);
      redirect(`/auth/error?message=${encodeURIComponent(error.message || '')}`);
    }

    // ✅ Sauvegarde le plan dans le cookie
    cookieStore.set('signup_plan', plan, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1h
      path: '/',
    });

    redirect(next);
  }

  // ✅ Si pas de code → on affiche la page de succès (optionnel, mais tu la veux)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/15 text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Compte confirmé avec succès ! 🎉
        </h1>

        <p className="text-gray-300 mb-8 leading-relaxed">
          Bienvenue chez LUVIKA !<br />
          Votre identité numérique est prête à briller.
        </p>

        <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 h-12 text-lg font-medium">
          <Link href="/auth/sign-in">
            Se connecter maintenant
          </Link>
        </Button>

        <p className="text-gray-500 text-sm mt-8">
          Vous pourrez compléter votre profil lors de votre première connexion.
        </p>
      </div>
    </div>
  );
}