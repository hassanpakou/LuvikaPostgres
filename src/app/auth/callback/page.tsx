// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';

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
      redirect(`/auth/error?message=${encodeURIComponent(error.message || '')}`);
    }

    cookieStore.set('signup_plan', plan, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    redirect(next);
  }

  // ✅ Design amélioré
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-cyan-900/10 to-indigo-900/5">
      <div className="relative w-full max-w-md">
        {/* 🔹 Bulles flottantes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float animation-delay-2000"></div>

        <div className="glass-border backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/15 text-center relative z-10 overflow-hidden">
          {/* 🔹 Glow interne */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-3xl -z-10"></div>

          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full mb-6 border border-emerald-400/30 shadow-lg">
            <CheckCircle className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-cyan-300 animate-pulse" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-4">
            Compte confirmé ! 🎉
          </h1>

          <p className="text-gray-300 mb-8 leading-relaxed">
            Bienvenue dans l'écosystème LUVIKA.<br />
            <span className="text-cyan-300 font-medium">Votre identité numérique est prête à briller.</span>
          </p>

          <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 h-12 text-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all duration-300">
            <Link href="/auth/sign-in">
              Accéder à mon tableau de bord
            </Link>
          </Button>

          <p className="text-gray-500 text-sm mt-8 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Vous pourrez personnaliser votre profil dès la première connexion.
          </p>
        </div>
      </div>
    </div>
  );
}