'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '../../../../src/lib/supabase/client'; // ✅ Correct import
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Lock, CheckCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">{t('auth.reset.verifying')}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-xl">{t('auth.reset.success_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-6">{t('auth.reset.success_message')}</p>
            <Button onClick={() => router.push('/auth/sign-in')} className="w-full">
              {t('auth.signin.submit')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 🔦 Bouton thème */}
      <ThemeToggle />

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
          <CardTitle className="text-xl">{t('auth.reset.title')}</CardTitle>
          <p className="text-gray-400">{t('auth.reset.subtitle')}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-300">
                {t('auth.reset.new_password')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-white/5 border-white/20"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-500">
              {t('auth.reset.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}