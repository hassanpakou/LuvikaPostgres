// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        const role = data.user.user_metadata?.role;
        router.push(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      console.error('Erreur connexion:', err);
      let message = t('auth.signin.error_generic');
      if (err.message?.includes('Invalid login credentials')) {
        message = t('auth.signin.error_credentials');
      } else if (err.message?.includes('email')) {
        message = t('auth.signin.error_email');
      } else if (err.message?.includes('password')) {
        message = t('auth.signin.error_password');
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Flèche retour Accueil */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
      >
        <Mail className="w-4 h-4" />
        <span className="text-sm">{t('navbar.home')}</span>
      </Link>

      {/* Conteneur — même taille que signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/15 relative overflow-hidden"
      >
        {/* Glow subtil */}
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
    </div>
  );
}