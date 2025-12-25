'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowLeft, ArrowRight, 
  Eye, EyeOff, Check, X, CreditCard, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '../../../lib/supabase/client';

type Step = 'plan' | 'identity' | 'email' | 'security';
type Plan = 'basic' | 'premium' | 'entreprise';

export default function SignUpPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>('plan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  const [formData, setFormData] = useState({
    plan: 'basic' as Plan,
    full_name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // ✅ Validations
  const isValidName = formData.full_name.trim().length >= 2;
  const isValidUsername = formData.username.trim().length >= 3 &&
    /^[a-z0-9_-]+$/.test(formData.username.trim()) &&
    formData.username.trim().length <= 20;
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

  // ✅ Focus automatique
  useEffect(() => {
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 'security' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  // ✅ Vérification email en temps réel
  useEffect(() => {
    if (!formData.email || !isValidEmail) {
      setEmailExists(false);
      return;
    }

    const checkEmail = async () => {
      setCheckingEmail(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return; // déjà connecté → skip

      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email.trim().toLowerCase())
        .maybeSingle();

      setEmailExists(!!data);
      setCheckingEmail(false);
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email, isValidEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
    if (name === 'email') setEmailExists(false);
  };

  // ✅ Sélection de plan — ne change PAS l’étape
  const handlePlanSelect = (plan: Plan) => {
    if (plan === 'entreprise') {
      setShowEnterpriseModal(true);
      return;
    }
    setFormData(prev => ({ ...prev, plan }));
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
    setStep('email');
  };

  const handleNextEmail = () => {
    if (!isValidEmail) {
      setError(t('auth.signup.error_email_format'));
      return;
    }
    if (emailExists) {
      setError(t('auth.signup.email_exists'));
      return;
    }
    setStep('security');
  };

  const handleBack = () => {
    setStep(prev => {
      if (prev === 'identity') return 'plan';
      if (prev === 'email') return 'identity';
      if (prev === 'security') return 'email';
      return 'plan';
    });
  };

  const handleSignUp = async () => {
    if (!isValidEmail || !allPasswordRulesMet || emailExists) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?plan=${formData.plan}`,
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(t('auth.signup.check_email') || '✅ Compte créé ! Vérifiez votre boîte mail.');
      setTimeout(() => router.push('/auth/sign-in'), 3000);
    } catch (err: any) {
      console.error('💥 Erreur inscription:', err);
      if (err.message?.includes('User already registered')) {
        setError(t('auth.signup.email_exists'));
      } else {
        setError(err.message || t('auth.signup.error_generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 'identity') return !isValidName || !isValidUsername;
    if (step === 'email') return !isValidEmail || emailExists || checkingEmail;
    if (step === 'security') return !allPasswordRulesMet;
    return false;
  };

  const steps = ['plan', 'identity', 'email', 'security'] as Step[];
  const currentStepIndex = steps.indexOf(step);

  // ✅ Couleurs par plan
  const getPlanColor = (plan: Plan) => {
    switch (plan) {
      case 'basic': return 'from-green-500 to-emerald-600';
      case 'premium': return 'from-cyan-400 to-blue-500';
      case 'entreprise': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br">
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
        {/* ✅ Barre de progression animée */}
        <div className="relative mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <motion.div
                key={s}
                className="flex flex-col items-center"
                initial={false}
                animate={{ scale: step === s ? 1.1 : 1 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i < currentStepIndex ? 'bg-white text-blue-600' :
                  step === s ? 'bg-cyan-500 text-white' :
                  'bg-white/10 text-gray-400'
                } mb-2 relative`}>
                  {i < currentStepIndex && <Check className="w-5 h-5 text-green-400" />}
                </div>
                <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
              </motion.div>
            ))}
          </div>

          {/* Ligne de progression */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStepIndex) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ✅ Titre + icône sous le titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-3">
            {step === 'plan' && t('auth.signup.choose_plan')}
            {step === 'identity' && t('auth.signup.title')}
            {step === 'email' && t('auth.signup.email_step')}
            {step === 'security' && t('auth.signup.security_step')}
          </h1>
          
          {/* Icône centrée sous le titre */}
          <motion.div
            key={step}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            {step === 'plan' && <CreditCard className="w-8 h-8 text-cyan-400" />}
            {step === 'identity' && <User className="w-8 h-8 text-cyan-400" />}
            {step === 'email' && <Mail className="w-8 h-8 text-cyan-400" />}
            {step === 'security' && <Lock className="w-8 h-8 text-cyan-400" />}
          </motion.div>

          <p className="text-gray-400 text-sm">
            {step === 'plan' && t('auth.signup.plan_desc')}
            {step === 'identity' && t('auth.signup.identity_desc')}
            {step === 'email' && t('auth.signup.email_desc')}
            {step === 'security' && t('auth.signup.security_desc')}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" /> {error}
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
            {/* ✅ ÉTAPE 1 : Choix du plan — avec animations et couleurs */}
            {step === 'plan' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'basic', title: t('pricing.plans.freemium.title'), desc: t('pricing.plans.freemium.desc'), price: '0', color: 'green' },
                    { id: 'premium', title: t('pricing.plans.premium.title'), desc: t('pricing.plans.premium.desc'), price: '12', color: 'cyan' },
                    { id: 'entreprise', title: t('pricing.plans.entreprise.title'), desc: t('pricing.plans.entreprise.desc'), price: '39', color: 'red' },
                  ].map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-xl"
                    >
                      {/* Animation de fond fluide */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(plan.id as Plan)} opacity-10`} />
                      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:20px_20px]" />

                      <button
                        type="button"
                        onClick={() => handlePlanSelect(plan.id as Plan)}
                        className={`w-full text-left p-5 rounded-xl border-2 relative z-10 transition-all ${
                          formData.plan === plan.id
                            ? plan.id === 'basic'
                              ? 'border-green-500 bg-green-500/10'
                              : plan.id === 'premium'
                              ? 'border-cyan-400 bg-cyan-400/10'
                              : 'border-red-500 bg-red-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white">{plan.title}</h3>
                              {plan.id === 'premium' && (
                                <span className="bg-cyan-500 text-xs px-2 py-0.5 rounded-full text-white">
                                  {t('pricing.plans.premium.popular')}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mt-1">{plan.desc}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">${plan.price}</div>
                            <div className="text-gray-400 text-sm">/mois</div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ ÉTAPE 2 : Identité */}
            {step === 'identity' && (
              <>
                <div>
                  <Label htmlFor="full_name" className="text-gray-300 mb-2 block">
                    {t('auth.signup.full_name')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
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
                  <Label htmlFor="username" className="text-gray-300 mb-2 block">
                    {t('auth.signup.username')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="nestor"
                      className="pl-12 pr-4 h-12 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                    />
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

            {/* ✅ ÉTAPE 3 : Email — avec validation temps réel */}
            {step === 'email' && (
              <div>
                <Label htmlFor="email" className="text-gray-300 mb-2 block">
                  {t('auth.signup.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <Input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="pl-12 pr-12 py-3 bg-white/5 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl"
                  />
                  {checkingEmail && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="animate-spin w-4 h-4">· · ·</span>
                    </span>
                  )}
                  {emailExists && !checkingEmail && (
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                  )}
                </div>
                {emailExists && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('auth.signup.email_exists')}
                  </p>
                )}
                {!isValidEmail && formData.email && !emailExists && (
                  <p className="text-xs text-red-400 mt-1">{t('auth.signup.error_email_format')}</p>
                )}
              </div>
            )}

            {/* ✅ ÉTAPE 4 : Sécurité */}
            {step === 'security' && (
              <>
                <div>
                  <Label htmlFor="password" className="text-gray-300 mb-2 block">
                    {t('auth.signup.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
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
                  <Label htmlFor="passwordConfirm" className="text-gray-300 mb-2 block">
                    {t('auth.signup.password_confirm')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
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

        {/* ✅ Navigation */}
        <div className="mt-10">
          <div className="flex justify-between">
            {step !== 'plan' && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('auth.signup.back')}
              </Button>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              onClick={
                step === 'plan' ? () => setStep('identity') :
                step === 'identity' ? handleNextIdentity :
                step === 'email' ? handleNextEmail :
                handleSignUp
              }
              disabled={isNextDisabled() || loading}
              className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 flex items-center px-6 py-3"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin w-4 h-4 mr-2">⚙️</span>
                  {t('auth.signup.creating')}
                </span>
              ) : (
                <>
                  {step !== 'security' ? t('auth.signup.next') : t('auth.signup.create_account')}
                  {step !== 'security' && <ArrowRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.signup.already_have_account')}{' '}
              <Link href="/auth/sign-in" className="text-cyan-300 hover:underline font-medium">
                {t('auth.signup.sign_in')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ✅ Modal Entreprise */}
      <AnimatePresence>
        {showEnterpriseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEnterpriseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('pricing.plans.entreprise.title')}
                </h3>
                <p className="text-gray-300 mb-4">
                  Ce plan n'est disponible que sur commande. Passez d'abord au plan <span className="text-cyan-400 font-medium">Professionnel</span>, puis contactez l'administrateur pour mettre à niveau vers Entreprise.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowEnterpriseModal(false)}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, plan: 'premium' }));
                      setShowEnterpriseModal(false);
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    Choisir Professionnel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}