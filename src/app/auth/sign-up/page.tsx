// src/app/auth/sign-up/page.tsx
'use client';


import { Label } from '@/components/ui/label';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '../../../lib/supabase/client';

type Step = 'identity' | 'email' | 'security';

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
    otp: '',
  });

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const isValidName = formData.full_name.trim().length >= 2;
  const isValidUsername = /^[a-z0-9_-]{3,20}$/.test(formData.username);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
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
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 'security' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleNextIdentity = () => {
    if (isValidName && isValidUsername) {
      setStep('email');
    }
  };

  // ✅ ÉTAPE 2 : Envoi OTP — sans création utilisateur
  const handleSendCode = async () => {
    if (!isValidEmail) return;

    setLoading(true);
    setError(null);

    try {
      // 🔍 Vérifie si email existe déjà
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const { exists } = await res.json();
      if (exists) {
        setError(t('auth.signup.email_exists'));
        return;
      }

      const supabase = createClient();
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false, // ✅ Crucial
        },
      });

      if (sendError) throw sendError;

      setIsEmailSent(true);
      setSuccess(t('auth.signup.code_sent'));
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err: any) {
      console.error('Erreur envoi code:', err);
      setError(err.message || t('auth.signup.error_email'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ ÉTAPE 2 : Vérification OTP + double-check
  const handleVerifyCode = async () => {
    if (!formData.otp) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (!data.user) {
        setError(t('auth.signup.invalid_code'));
        return;
      }

      // 🔐 Double vérification (concurrent)
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const { exists } = await checkRes.json();
      if (exists) {
        setError(t('auth.signup.email_exists'));
        return;
      }

      setIsEmailVerified(true);
      setStep('security');
    } catch (err: any) {
      console.error('Erreur vérification:', err);
      setError(t('auth.signup.invalid_code'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ ÉTAPE 3 : Création compte
  const handleCreateAccount = async () => {
    if (!allPasswordRulesMet || !isEmailVerified) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 🔐 Triple vérification (anti-race)
const {  count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .eq('email', formData.email);

      if ((count || 0) > 0) {
        setError(t('auth.signup.email_exists'));
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
            username: formData.username.trim().toLowerCase(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // ✅ Activation 2FA (optionnelle en dev)
      try {
        await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'LUVIKA',
          friendlyName: `${formData.full_name}'s LUVIKA`,
        });
      } catch (totpErr) {
        console.warn('2FA skipped in dev', totpErr);
      }

      setSuccess(t('auth.signup.success'));
      setTimeout(() => router.push('/auth/sign-in'), 2000);
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || t('auth.signup.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled =
    step === 'identity'
      ? !isValidName || !isValidUsername
      : step === 'email' && !isEmailVerified
      ? !formData.otp
      : step === 'security'
      ? !allPasswordRulesMet
      : false;

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
          {(['identity', 'email', 'security'] as Step[]).map((s, i) => {
            const isActive = step === s;
            const isCompleted =
              (s === 'identity' && step !== 'identity') ||
              (s === 'email' && isEmailVerified) ||
              (s === 'security' && false);

            const Icon = s === 'identity' ? User : s === 'email' ? Mail : Lock;
            const color = isCompleted
              ? 'bg-white text-blue-600'
              : isActive
              ? 'bg-cyan-500 text-white'
              : 'bg-white/10 text-gray-400';

            return (
              <motion.div
                key={s}
                className="flex flex-col items-center"
                initial={{ scale: 1 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${color} mb-2 relative`}
                >
                  <Icon className="w-5 h-5" />
                  {isCompleted && (
                    <Check className="w-4 h-4 text-green-400 absolute -bottom-1 -right-1 bg-black rounded-full" />
                  )}
                </div>
                <span className="text-xs text-gray-400">{i + 1}</span>
              </motion.div>
            );
          })}
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          {step === 'identity'
            ? t('auth.signup.title')
            : step === 'email'
            ? t('auth.signup.email_step')
            : t('auth.signup.security_step')}
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          {step === 'identity'
            ? t('auth.signup.identity_desc')
            : step === 'email'
            ? t('auth.signup.email_desc')
            : t('auth.signup.security_desc')}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-900/30 text-green-200 p-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              {success}
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
                    <Label htmlFor="full_name" className="sr-only">
                      {t('auth.signup.full_name')}
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder={t('auth.signup.full_name_placeholder')}
                      className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                      autoComplete="name"
                    />
                    {!isValidName && formData.full_name && (
                      <p className="text-xs text-red-400 mt-1">
                        {t('auth.signup.error_name')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Label htmlFor="username" className="sr-only">
                      {t('auth.signup.username')}
                    </Label>
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
                        autoComplete="username"
                        className="pl-12 pr-4 h-12 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('auth.signup.username_hint_plain', {
                        username: formData.username || 'votre_nom',
                      })}
                    </p>
                    {!isValidUsername && formData.username && (
                      <p className="text-xs text-red-400 mt-1">
                        {t('auth.signup.error_username')}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 'email' && (
              <>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="email" className="sr-only">
                      {t('auth.signup.email')}
                    </Label>
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                      autoComplete="email"
                    />
                    {!isValidEmail && formData.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {t('auth.signup.error_email_format')}
                      </p>
                    )}
                  </div>
                </div>

                {!isEmailSent ? (
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading || !isValidEmail}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400"
                  >
                    {loading ? t('auth.signup.sending') : t('auth.signup.send_code')}
                  </Button>
                ) : (
                  <>
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                        <Label htmlFor="otp" className="sr-only">
                          {t('auth.signup.otp')}
                        </Label>
                        <Input
                          ref={otpInputRef}
                          id="otp"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          className="pl-12 pr-4 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                          maxLength={8}
                          placeholder="12345678"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={loading || !formData.otp}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400"
                    >
                      {t('auth.signup.verify_code')}
                    </Button>
                  </>
                )}
              </>
            )}

            {step === 'security' && (
              <>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="password" className="sr-only">
                      {t('auth.signup.password')}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        ref={passwordInputRef}
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Label htmlFor="passwordConfirm" className="sr-only">
                      {t('auth.signup.password_confirm')}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.length ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_length')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.uppercase
                          ? 'bg-green-400'
                          : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_uppercase')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.lowercase
                          ? 'bg-green-400'
                          : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_lowercase')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.number ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_number')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.special ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_special')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordRules.match ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    {t('auth.signup.password_match')}
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
                  <Lock className="w-4 h-4 inline mr-1 mb-0.5" />
                  {t('auth.signup.2fa_enabled')}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step !== 'identity' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setStep(step === 'email' ? 'identity' : 'email')
              }
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('auth.signup.back')}
            </Button>
          )}

          <div className="flex-1" />

          {step !== 'security' ? (
            <Button
              type="button"
              onClick={
                step === 'identity' ? handleNextIdentity : handleVerifyCode
              }
              disabled={isNextDisabled || loading}
              className="bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 flex items-center"
            >
              {t('auth.signup.next')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreateAccount}
              disabled={isNextDisabled || loading}
              className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 flex items-center"
            >
              {loading ? t('auth.signup.creating') : t('auth.signup.create_account')}
            </Button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            {t('auth.signup.already_have_account')}{' '}
            <Link
              href="/auth/sign-in"
              className="text-cyan-300 hover:underline font-medium"
            >
              {t('auth.signup.sign_in')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}