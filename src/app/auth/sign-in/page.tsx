// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/src/lib/supabase/client';

// Traductions simplifiées (ou utilisez next-intl si déjà présent)
const t = (key: string) => {
  const dict: Record<string, string> = {
    'auth.signin.title': 'Connexion',
    'auth.signin.subtitle': 'Connectez-vous à votre compte LUVIKA',
    'auth.signin.email': 'Email',
    'auth.signin.password': 'Mot de passe',
    'auth.signin.forgot_password': 'Mot de passe oublié ?',
    'auth.signin.submit': 'Se connecter',
    'auth.signin.connecting': 'Connexion en cours...',
    'auth.signin.no_account': 'Vous n\'avez pas de compte ?',
    'auth.signin.sign_up': 'S\'inscrire',
    'auth.signin.error_credentials': 'Email ou mot de passe incorrect.',
    'navbar.home': 'Accueil',
  };
  return dict[key] || key;
};

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Vérification session existante
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
    passwordInputRef.current?.focus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(t('auth.signin.error_credentials'));
      setLoading(false);
      return;
    }

    // Vérification désactivation
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('deactivated')
      .eq('id', user?.id)
      .single();

    if (profile?.deactivated) {
      await supabase.auth.signOut();
      setError('Ce compte a été désactivé. Contactez le support.');
      setLoading(false);
      return;
    }

    // Redirection
    const role = user?.user_metadata?.role;
    router.push(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.08),transparent_70%)]" />

      {/* Lien retour accueil */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 text-gray-400 hover:text-cyan-300 transition-colors text-sm flex items-center gap-1 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t('navbar.home')}
      </Link>

      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="relative glass-border rounded-2xl p-6 md:p-8">
          {/* Bandeau supérieur */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-2xl" />

          {/* Logo / icône */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
              <User className="w-8 h-8 text-cyan-300" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            {t('auth.signin.title')}
          </h1>
          <p className="text-gray-400 text-center text-sm mt-1 mb-6">
            {t('auth.signin.subtitle')}
          </p>

          {/* Message d'erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder={t('auth.signin.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-white/5 border-white/15 focus:border-cyan-400/50 text-white"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.signin.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 bg-white/5 border-white/15 focus:border-cyan-400/50 text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                {t('auth.signin.forgot_password')}
              </Link>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Sécurisé</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2 rounded-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('auth.signin.connecting')}
                </span>
              ) : (
                t('auth.signin.submit')
              )}
            </Button>
          </form>

          {/* Lien inscription */}
          <div className="mt-6 pt-4 text-center text-sm text-gray-400 border-t border-white/10">
            {t('auth.signin.no_account')}{' '}
            <Link href="/auth/sign-up" className="text-cyan-300 hover:text-cyan-200 font-medium">
              {t('auth.signin.sign_up')}
            </Link>
          </div>

          {/* Liens légaux */}
          <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-cyan-300">Confidentialité</Link>
            <Link href="/terms" className="hover:text-cyan-300">Conditions</Link>
            <Link href="/contact" className="hover:text-cyan-300">Contact</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}