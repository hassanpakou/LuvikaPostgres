// src/app/auth/forgot-password/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    } else if (step === 'reset' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  // Validation mot de passe
  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password === passwordConfirm && passwordConfirm.length > 0,
  };
  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);

  // Étape 1 : Envoi lien de réinitialisation (Supabase)
  const handleSendReset = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (sendError) throw sendError;

      setSuccess(t('auth.forgot_password.email_sent'));
      // ✅ Supabase envoie un lien magique → pas besoin d'OTP ici
      // On redirige directement vers reset après ouverture du lien
      setTimeout(() => router.push('/auth/sign-in'), 3000);
    } catch (err: any) {
      console.error('Erreur reset:', err);
      setError(t('auth.forgot_password.error'));
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 & 3 : Gérées par Supabase via le lien magique
  // → Tu peux créer `/auth/reset-password/page.tsx` si tu veux un formulaire OTP

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Link 
        href="/auth/sign-in" 
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{t('auth.forgot_password.back_to_login')}</span>
      </Link>

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
          {t('auth.forgot_password.title')}
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          {t('auth.forgot_password.subtitle')}
        </p>

        {/* ✅ Plus de AnimatePresence — simple div */}
        <div className="space-y-5">
          {error && (
            <div className="bg-red-900/30 text-red-200 p-3 rounded-lg flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/30 text-green-200 p-3 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Étape email (seule étape nécessaire avec lien magique) */}
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

        <Button
          onClick={handleSendReset}
          disabled={loading || !email}
          className="w-full mt-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 rounded-xl font-medium transition-all shadow-lg hover:shadow-cyan-500/30"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin w-4 h-4 mr-2">⚙️</span>
              {t('auth.forgot_password.sending')}
            </span>
          ) : (
            t('auth.forgot_password.submit')
          )}
        </Button>
      </motion.div>
    </div>
  );
}