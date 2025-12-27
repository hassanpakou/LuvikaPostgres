// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '../../../lib/supabase/client';

// 🔹 Composant bulles (identique à celui du Navbar)
const IceBubbles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="bubble bubble-1" />
    <div className="bubble bubble-2" />
    <div className="bubble bubble-3" />
    <div className="bubble bubble-4" />
    <div className="bubble bubble-5" />
  </div>
);

// ✨ Styles des bulles
const BubbleStyles = `
  @keyframes floatBubble {
    0% { transform: translateY(0) scale(1); opacity: 0.5; }
    100% { transform: translateY(-120px) scale(1.6); opacity: 0; }
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%);
    filter: blur(0.8px);
    opacity: 0.4;
    mix-blend-mode: screen;
  }
  .bubble-1 { animation: floatBubble 7s infinite; left: 8%; top: 100%; width: 22px; height: 22px; }
  .bubble-2 { animation: floatBubble 9s infinite; left: 22%; top: 105%; animation-delay: 1.2s; width: 14px; height: 14px; }
  .bubble-3 { animation: floatBubble 8s infinite; left: 42%; top: 102%; animation-delay: 0.7s; width: 30px; height: 30px; }
  .bubble-4 { animation: floatBubble 11s infinite; left: 62%; top: 100%; animation-delay: 0.3s; width: 18px; height: 18px; }
  .bubble-5 { animation: floatBubble 10s infinite; left: 82%; top: 107%; animation-delay: 2.1s; width: 26px; height: 26px; }
`;

export default function SignInPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // ✅ Ici, dans le scope

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      await new Promise(r => setTimeout(r, 100));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No session after login');

      const role = session.user.user_metadata?.role;

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

      // ✅ Déclenche le modal après la redirection (effet visuel)
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);

    } catch (err: any) {
      console.error('💥 Login failed:', err);
      setError(t('auth.signin.error_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{BubbleStyles}</style>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
        >
          <Mail className="w-4 h-4" />
          <span className="text-sm">{t('navbar.home')}</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/15 relative overflow-hidden"
        >
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500/5 animate-float" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-white">
            {t('auth.signin.title')}
          </h1>
          <p className="text-gray-400 text-center text-sm mb-6">
            {t('auth.signin.subtitle') || 'Connectez-vous à votre compte LUVIKA.'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <Label htmlFor="email" className="sr-only">
                {t('auth.signin.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <Label htmlFor="password" className="sr-only">
                {t('auth.signin.password')}
              </Label>
              <Input
                id="password"
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white rounded-xl transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-cyan-300 hover:text-cyan-200 font-medium hover:underline"
              >
                {t('auth.signin.forgot_password')}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 rounded-xl font-medium transition-all shadow-lg hover:shadow-cyan-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin w-4 h-4 mr-2">⚙️</span>
                  {t('auth.signin.connecting')}
                </span>
              ) : (
                t('auth.signin.submit')
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.signin.no_account')}{' '}
              <Link 
                href="/auth/sign-up" 
                className="text-cyan-300 hover:underline font-medium"
              >
                {t('auth.signin.sign_up')}
              </Link>
            </p>
          </div>
        </motion.div>

        {/* 🔹 Modal d’accueil — déclenché après connexion */}
        <AnimatePresence>
          {showWelcomeModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gradient-to-b from-black/5 to-black/15 z-[100]"
                onClick={closeWelcomeModal}
              >
                <IceBubbles />
              </motion.div>

              {/* Modal centré */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative backdrop-blur-2xl bg-transparent rounded-2xl border border-white/15 shadow-xl w-full max-w-sm">
                  {/* 🔹 Bulles à l’intérieur */}
                  <IceBubbles />

                  {/* ✕ Fermer */}
                  <button
                    onClick={closeWelcomeModal}
                    className="absolute top-4 right-4 text-gray-300 hover:text-white z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Contenu */}
                  <div className="px-6 py-10 text-center relative z-10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
                      {t('auth.welcome.title')}
                    </h3>
                    <p className="text-gray-200 text-base drop-shadow-sm">
                      {t('auth.welcome.message')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}