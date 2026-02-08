// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X, Sun, Moon } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { createClient } from '../../../../src/lib/supabase/client';

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.signin.title': 'Connexion',
    'auth.signin.subtitle': 'Connectez-vous à votre compte LUVIKA.',
    'auth.signin.email': 'Email',
    'auth.signin.password': 'Mot de passe',
    'auth.signin.forgot_password': 'Mot de passe oublié ?',
    'auth.signin.submit': 'Se connecter',
    'auth.signin.connecting': 'Connexion en cours...',
    'auth.signin.no_account': 'Vous n\'avez pas de compte ?',
    'auth.signin.sign_up': 'S\'inscrire',
    'auth.signin.error_credentials': 'Email ou mot de passe incorrect.',
    'auth.welcome.title': 'Bienvenue !',
    'auth.welcome.message': 'Heureux de vous revoir parmi nous.',
    'navbar.home': 'Accueil'
  };
  return translations[key as keyof typeof translations] || key;
};


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

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

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

      await new Promise(r => setTimeout(r, 300));

      const { data : { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No session');

      const role = session.user.user_metadata?.role;

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

      // ✅ Modal après redirection
      setTimeout(() => setShowWelcomeModal(true), 800);

    } catch (err: any) {
      console.error('💥 Login failed:', err);
      setError(t('auth.signin.error_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond dynamique */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)]" />
      <FloatingBubbles />

      {/* 🔙 Retour accueil */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-all group"
      >
        <motion.div
          whileHover={{ x: -4 }}
          className="p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyan-500/10"
        >
          <Mail className="w-4 h-4" />
        </motion.div>
        <span className="text-sm font-medium">{t('navbar.home')}</span>
      </Link>

      {/* 🔦 Bouton thème */}
      <ThemeToggle />

      {/* 🔷 Card principale */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
          {/* 🔹 Glow interne */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 blur opacity-30" />
          
          <div className="relative p-7 md:p-8">
            <div className="text-center mb-7">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/10"
              >
                <Lock className="w-7 h-7 text-cyan-300" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {t('auth.signin.title')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('auth.signin.subtitle') || 'Connectez-vous à votre compte LUVIKA.'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-3 rounded-xl bg-red-900/20 border border-red-500/30 flex items-center gap-2"
              >
                <X className="w-4 h-4 text-red-300 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 🔹 Email */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Label htmlFor="email" className="sr-only">
                  {t('auth.signin.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-12 pr-4 py-4 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                  autoComplete="email"
                />
              </div>

              {/* 🔹 Mot de passe */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
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
                  className="pl-12 pr-12 py-4 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white rounded-xl transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* 🔹 Mot de passe oublié */}
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-cyan-300 hover:text-cyan-200 font-medium hover:underline transition-colors"
                >
                  {t('auth.signin.forgot_password')}
                </Link>
              </div>

              {/* 🔹 Bouton login */}
              <GlassButton
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600/80 to-blue-500/80 hover:from-cyan-600 hover:to-blue-500"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>{t('auth.signin.connecting')}</span>
                  </>
                ) : (
                  t('auth.signin.submit')
                )}
              </GlassButton>
            </form>

            {/* 🔹 Inscription */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                {t('auth.signin.no_account')}{' '}
                <Link 
                  href="/auth/sign-up" 
                  className="text-cyan-300 hover:underline font-medium transition-colors"
                >
                  {t('auth.signin.sign_up')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔹 Modal d’accueil */}
      <AnimatePresence>
        {showWelcomeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              onClick={() => setShowWelcomeModal(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/15 shadow-2xl w-full max-w-sm overflow-hidden">
                <FloatingBubbles />
                
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-gray-300 hover:text-white z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-6 py-10 text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    {t('auth.welcome.title')}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-200 text-base"
                  >
                    {t('auth.welcome.message')}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
