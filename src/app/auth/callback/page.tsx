// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

// 🔹 Effet bulles flottantes
const FloatingBubbles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
        style={{
          width: `${12 + i * 6}px`,
          height: `${12 + i * 6}px`,
          left: `${10 + i * 18}%`,
          bottom: '-20px',
        }}
        animate={{
          y: [-20, -140],
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 6 + i,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeOut"
        }}
      />
    ))}
  </div>
);

// 🔹 Bouton glassmorphism animé
const GlassButton = ({ 
  children, 
  onClick, 
  disabled,
  className = "",
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}) => (
  <motion.button
    type={type as any}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={disabled}
    className={`
      relative overflow-hidden
      px-6 py-3 rounded-xl
      bg-white/10 backdrop-blur-xl
      border border-white/20
      text-white font-medium
      transition-all duration-300
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}
      ${className}
    `}
  >
    {/* ✨ Micro-anim inside */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
  </motion.button>
);

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Server-side translations
  const t = (key: string) => {
    const translations = {
      'auth.callback.back_to_login': 'Retour à la connexion',
      'auth.callback.title': 'Vérification en cours...',
      'auth.callback.subtitle': 'Votre compte est en cours de vérification. Veuillez patienter.',
      'auth.callback.dashboard': 'Accéder au tableau de bord',
      'auth.callback.customize': 'Personnalisez votre profil dès maintenant'
    };
    return translations[key as keyof typeof translations] || key;
  };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond dynamique */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)]" />
      <FloatingBubbles />

      <Link 
        href="/auth/sign-in" 
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{t('auth.callback.back_to_login')}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
          {/* 🔹 Glow interne */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 blur opacity-30" />

          <div className="relative p-7 md:p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-white/10"
            >
              <CheckCircle className="w-7 h-7 text-emerald-400" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyan-300 animate-pulse" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
              {t('auth.callback.title')}
            </h1>
            <p className="text-gray-400 text-sm">
              {t('auth.callback.subtitle')}
            </p>

            <div className="mt-8 flex justify-center">
              <GlassButton
                onClick={() => window.location.href = '/auth/sign-in'}
                className="bg-gradient-to-r from-emerald-600/80 to-cyan-500/80 hover:from-emerald-600 hover:to-cyan-500"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {t('auth.callback.dashboard')}
              </GlassButton>
            </div>

            <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {t('auth.callback.customize')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
