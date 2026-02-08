'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, X, Check, Sun, Moon } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { createClient } from '../../../../src/lib/supabase/client'; // ✅ Correct import

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

// 🔹 Server-side translations
const t = (key: string) => {
  const translations = {
    'auth.forgot_password.back_to_login': 'Retour à la connexion',
    'auth.forgot_password.title': 'Réinitialisation du mot de passe',
    'auth.forgot_password.subtitle': 'Entrez votre email pour recevoir un lien de réinitialisation.',
    'auth.forgot_password.email': 'Adresse email',
    'auth.forgot_password.email_placeholder': 'votre@email.com',
    'auth.forgot_password.submit': 'Envoyer le lien',
    'auth.forgot_password.success': 'Un email de réinitialisation a été envoyé à votre adresse.',
    'auth.forgot_password.error': 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.',
    'auth.forgot_password.sending': 'Envoi en cours...'
  };
  return translations[key as keyof typeof translations] || key;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  // ✅ Envoi du lien de réinitialisation
  const handleSendReset = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (sendError) throw sendError;

      setSuccess(t('auth.forgot_password.email_sent'));
      setTimeout(() => router.push('/auth/sign-in'), 3000);
    } catch (err: any) {
      console.error('Erreur reset:', err);
      setError(err.message || t('auth.forgot_password.error'));
    } finally {
      setLoading(false);
    }
  };

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
        <span className="text-sm">{t('auth.forgot_password.back_to_login')}</span>
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
              <Mail className="w-7 h-7 text-cyan-300" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
              {t('auth.forgot_password.title')}
            </h1>
            <p className="text-gray-400 text-sm">
              {t('auth.forgot_password.subtitle')}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div className="bg-green-900/30 text-green-200 p-3 rounded-lg mb-6 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <Label htmlFor="email" className="sr-only">
                  {t('auth.forgot_password.email')}
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
            </div>

            <GlassButton
              onClick={handleSendReset}
              disabled={loading || !email}
              className="w-full mt-8 bg-gradient-to-r from-cyan-600/80 to-blue-500/80 hover:from-cyan-600 hover:to-blue-500"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>{t('auth.forgot_password.sending')}</span>
                </>
              ) : (
                t('auth.forgot_password.submit')
              )}
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}