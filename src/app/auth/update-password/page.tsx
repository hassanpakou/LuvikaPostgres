'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '../../../../src/lib/supabase/client'; // ✅ Correct import
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Lock, CheckCircle, Sun, Moon, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

// 🔦 Bouton thème
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') !== 'light';
    }
    return true; // default to dark
  });

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="absolute top-6 right-6 p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default function UpdatePasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const nextParam = searchParams.get('next');
      const next = nextParam && nextParam.startsWith('/') ? nextParam : '/';

      if (!tokenHash || type !== 'recovery') {
        setError(t('auth.reset.invalid_link'));
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // 🔑 Vérifier le token AVANT redirection
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (error) {
          console.error('Erreur OTP:', error);
          throw new Error(t('auth.reset.invalid_link'));
        }

        // ✅ Token valide → on peut rediriger après
        router.replace(next, { scroll: false });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || t('auth.reset.invalid_link'));
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push('/auth/sign-in'), 2000);
    } catch (err: any) {
      setError(err.message || t('auth.reset.error_update'));
    }
  };

  if (loading) {
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
          <span className="text-sm">{t('auth.reset.back_to_login')}</span>
        </Link>

        {/* 🔦 Bouton thème */}
        <ThemeToggle />

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
                className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/10"
              >
                <Lock className="w-7 h-7 text-cyan-300" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {t('auth.reset.verifying')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('auth.reset.verifying_subtitle')}
              </p>

              <div className="mt-8 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
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
          <span className="text-sm">{t('auth.reset.back_to_login')}</span>
        </Link>

        {/* 🔦 Bouton thème */}
        <ThemeToggle />

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
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {t('auth.reset.success_title')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('auth.reset.success_message')}
              </p>

              <div className="mt-8 flex justify-center">
                <GlassButton
                  onClick={() => router.push('/auth/sign-in')}
                  className="bg-gradient-to-r from-emerald-600/80 to-cyan-500/80 hover:from-emerald-600 hover:to-cyan-500"
                >
                  {t('auth.signin.submit')}
                </GlassButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
        <span className="text-sm">{t('auth.reset.back_to_login')}</span>
      </Link>

      {/* 🔦 Bouton thème */}
      <ThemeToggle />

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
              className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/10"
            >
              <Lock className="w-7 h-7 text-cyan-300" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
              {t('auth.reset.title')}
            </h1>
            <p className="text-gray-400 text-sm">
              {t('auth.reset.subtitle')}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-gray-300">
                  {t('auth.reset.new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                  />
                </div>
              </div>

              <GlassButton
                type="submit"
                disabled={!password}
                className="w-full bg-gradient-to-r from-cyan-600/80 to-blue-500/80 hover:from-cyan-600 hover:to-blue-500"
              >
                {t('auth.reset.submit')}
              </GlassButton>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
