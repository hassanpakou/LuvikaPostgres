'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '../../../lib/supabase/client';

type Step = 'identity' | 'credentials';

export default function SignUpPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>('identity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const isValidName = formData.full_name.trim().length >= 2;
  const isValidUsername = formData.username.trim().length >= 3 &&
  /^[a-z0-9_-]+$/.test(formData.username.trim()) &&
  formData.username.trim().length <= 20;  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
    match: formData.password === formData.passwordConfirm,
  };
  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    if (step === 'credentials' && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

const handleNextIdentity = () => {
  if (!isValidName) {
    setError(t('auth.signup.error_name'));
    return;
  }
  if (!isValidUsername) {
    setError(t('auth.signup.error_username'));
    return;
  }
  // ✅ Ajoute cette ligne :
  setStep('credentials');
};


  // ✅ ÉTAPE 2 : Envoi email de confirmation (sans OTP)
  const handleSignUp = async () => {
  console.log('🚀 handleSignUp appelé avec:', {
    email: formData.email.trim(),
    hasData: !!formData.full_name || !!formData.username,
  });

  if (!isValidEmail || !allPasswordRulesMet) return;

  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const supabase = createClient();

    const signUpPayload = {
      email: formData.email.trim(),
      password: formData.password,
      options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    };

    console.log('📤 Payload envoyé à supabase.auth.signUp():', signUpPayload);

    const { data, error: signUpError } = await supabase.auth.signUp(signUpPayload);

    console.log('✅ Réponse Supabase:', { data, error: signUpError });

    if (signUpError) throw signUpError;

setSuccess(t('auth.signup.check_email') || '✅ Compte créé ! Vérifiez votre boîte mail pour confirmer votre inscription.');  } catch (err: any) {
    console.error('💥 Erreur complète:', err);
    setError(err.message || t('auth.signup.error_generic'));
  } finally {
    setLoading(false);
  }
};

  const isNextDisabled = step === 'identity'
    ? !isValidName || !isValidUsername
    : !isValidEmail || !allPasswordRulesMet;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{t('navbar.home')}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/15"
      >
        <div className="flex justify-between mb-10">
          {(['identity', 'credentials'] as Step[]).map((s, i) => {
            const isActive = step === s;
            const isCompleted = s === 'identity' && step === 'credentials';
            const Icon = s === 'identity' ? User : Lock;
            const color = isCompleted
              ? 'bg-white text-blue-600'
              : isActive
              ? 'bg-cyan-500 text-white'
              : 'bg-white/10 text-gray-400';

            return (
              <motion.div
                key={s}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} mb-2 relative`}>
                  <Icon className="w-5 h-5" />
                  {isCompleted && <Check className="w-4 h-4 text-green-400 absolute -bottom-1 -right-1 bg-black rounded-full" />}
                </div>
                <span className="text-xs text-gray-400">{i + 1}</span>
              </motion.div>
            );
          })}
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          {step === 'identity' ? t('auth.signup.title') : t('auth.signup.security_step')}
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          {step === 'identity' ? t('auth.signup.identity_desc') : t('auth.signup.security_desc')}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div className="bg-green-900/30 text-green-200 p-3 rounded-lg mb-6 flex items-center gap-2">
              <Check className="w-4 h-4" /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {step === 'identity' && (
              <>
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="full_name" className="sr-only">{t('auth.signup.full_name')}</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder={t('auth.signup.full_name_placeholder')}
                      className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                    />
                    {!isValidName && formData.full_name && (
                      <p className="text-xs text-red-400 mt-1">{t('auth.signup.error_name')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Label htmlFor="username" className="sr-only">{t('auth.signup.username')}</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 h-full flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-cyan-400" />
                      </span>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="nestor"
                        className="pl-12 pr-4 h-12 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('auth.signup.username_hint_plain', { username: formData.username || 'votre_nom' })}
                    </p>
                    {!isValidUsername && formData.username && (
                      <p className="text-xs text-red-400 mt-1">{t('auth.signup.error_username')}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 'credentials' && (
              <>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="email" className="sr-only">{t('auth.signup.email')}</Label>
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                    />
                    {!isValidEmail && formData.email && (
                      <p className="text-xs text-red-400 mt-1">{t('auth.signup.error_email_format')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="password" className="sr-only">{t('auth.signup.password')}</Label>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="passwordConfirm" className="sr-only">{t('auth.signup.password_confirm')}</Label>
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  {Object.entries(passwordRules).map(([key, valid]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${valid ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {t(`auth.signup.password_${key}`)}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
                  <Lock className="w-4 h-4 inline mr-1" />
                  {t('auth.signup.2fa_enabled')}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step === 'credentials' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('identity')}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('auth.signup.back')}
            </Button>
          )}

          <div className="flex-1" />

          <Button
            type="button"
            onClick={step === 'identity' ? handleNextIdentity : handleSignUp}
            disabled={isNextDisabled || loading}
            className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 flex items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin w-4 h-4 mr-2">⚙️</span>
                {t('auth.signup.creating')}
              </span>
            ) : (
              <>
                {step === 'identity' ? t('auth.signup.next') : t('auth.signup.create_account')}
                {step === 'identity' && <ArrowRight className="w-4 h-4 ml-1" />}
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            {t('auth.signup.already_have_account')}{' '}
            <Link href="/auth/sign-in" className="text-cyan-300 hover:underline font-medium">
              {t('auth.signup.sign_in')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}