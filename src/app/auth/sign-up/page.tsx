// src/app/auth/sign-up/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowLeft, ArrowRight, 
  Eye, EyeOff, Check, X, CreditCard, AlertCircle, 
  Sun, Moon, Sparkle, ShieldCheck, Smartphone, 
  CheckCircle, Zap, Crown, Building2, Settings, Loader2, ArrowUp, Users
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { createClient } from '../../../lib/supabase/client';
import { SiSocialblade } from 'react-icons/si';

const t = (key: string) => {
  const translations = {
    // Titres et descriptions des étapes
    'auth.signup.email_title': 'Adresse email',
    'auth.signup.security_title': 'Sécurité',
    'auth.signup.email_desc': 'Entrez votre adresse email',
    'auth.signup.security_desc': 'Choisissez un mot de passe sécurisé',
    
    // Champs
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Mot de passe',
    'auth.signup.password_confirm': 'Confirmez le mot de passe',
    
    // Messages d'erreur et succès
    'auth.signup.error_email_format': 'Seule une adresse Gmail (@gmail.com) est acceptée',
    'auth.signup.email_exists': 'Cet email est déjà utilisé',
    'auth.signup.check_email': '✅ Compte créé ! Vérifiez votre boîte mail.',
    'auth.signup.error_generic': 'Erreur lors de la création du compte',
    
    // Navigation
    'auth.signup.back': 'Retour',
    'auth.signup.next': 'Suivant',
    'auth.signup.create_account': 'Créer le compte',
    'auth.signup.creating': 'Création en cours...',
    'auth.signup.already_have_account': 'Vous avez déjà un compte ?',
    'auth.signup.sign_in': 'Se connecter',
    
    // Divers
    'auth.signup.2fa_enabled': 'Authentification à deux facteurs activée',
    'LUVIKA': 'LUVIKA',
    'tagline': 'Votre identité digitale en un tap NFC',
    'admin.stats.total_users': 'Utilisateurs enregistrés',
    'navbar.home': 'Accueil',
  };
  return translations[key as keyof typeof translations] || key;
};

// 🔹 Effet bulles flottantes optimisé
const FloatingBubbles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10"
        style={{
          width: `${8 + i * 4}px`,
          height: `${8 + i * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.sin(i) * 15, 0],
          scale: [0.9, 1.1, 0.9],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8 + i * 1.5,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// 🔹 Badge de sécurité premium
const SecurityBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 mb-5"
  >
    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-[12px] font-bold text-emerald-300 flex items-center gap-1.5">
  <span>Sécurité renforcée</span>
  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 text-[10px] py-0.5 px-1.5">
    <CheckCircle className="w-2.5 h-2.5 mr-0.5 inline" />
    AES-256
  </Badge>
</div>
      <p className="text-[11px] text-emerald-200/80 mt-0.5">
        Chiffrement de bout en bout • Protection anti-phishing • Authentification à deux facteurs
      </p>
    </div>
  </motion.div>
);

type Step = 'email' | 'security';
type Plan = 'basic' | 'premium' | 'entreprise';

export default function SignUpPage() {
  const router = useRouter();
const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isDark, setIsDark] = useState(true);
const [emailTouched, setEmailTouched] = useState(false);

const [formData, setFormData] = useState({
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

  // 🔹 Détection thème système
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  // ✅ Validations
 // Validation email plus stricte
const isValidEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email);
  // Règles simplifiées : longueur minimale 6 caractères et confirmation
const isPasswordLengthValid = formData.password.length >= 6;
const doPasswordsMatch = formData.password === formData.passwordConfirm;
const allPasswordRulesMet = isPasswordLengthValid && doPasswordsMatch;

  useEffect(() => {
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 'security' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!formData.email || !isValidEmail) {
      setEmailExists(false);
      return;
    }

    const checkEmail = async () => {
      setCheckingEmail(true);
      const supabase = createClient();
      const { data : { session } } = await supabase.auth.getSession();
      if (session) return;

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

  const handlePlanSelect = (plan: Plan) => {
    if (plan === 'entreprise') {
      setShowEnterpriseModal(true);
      return;
    }
    setFormData(prev => ({ ...prev, plan }));
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
  setStep(prev => (prev === 'security' ? 'email' : 'email'));
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(t('auth.signup.check_email') || '✅ Compte créé ! Vérifiez votre boîte mail.');
      
      // Afficher modal de bienvenue après succès
      setTimeout(() => {
        setShowWelcomeModal(true);
        setTimeout(() => router.push('/auth/sign-in'), 3000);
      }, 1000);
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
  if (step === 'email') return !isValidEmail || emailExists || checkingEmail;
  if (step === 'security') return !allPasswordRulesMet;
  return false;
};

const steps = ['email', 'security'] as Step[];
  const currentStepIndex = steps.indexOf(step);

  const getPlanColor = (plan: Plan) => {
    switch (plan) {
      case 'basic': return 'from-green-500 to-emerald-600';
      case 'premium': return 'from-cyan-400 to-blue-500';
      case 'entreprise': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanIcon = (plan: Plan) => {
    switch (plan) {
      case 'basic': return Zap;
      case 'premium': return Crown;
      case 'entreprise': return Building2;
      default: return CreditCard;
    }
  };

  const stepIcons = {
    email: Mail,
    security: Lock,
  };

  const stepTitles = {
    email: t('auth.signup.email_title'),
    security: t('auth.signup.security_title'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond dynamique premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
      <FloatingBubbles />
      
      {/* 🔙 Retour accueil - Design premium */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-cyan-300 transition-all group z-10"
      >
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">← {t('navbar.home')}</span>
          <span className="text-[10px] text-cyan-400/80 hidden sm:block">Retour à l'accueil</span>
        </div>
      </Link>

      {/* 🔦 Bouton thème - Design premium */}
      <motion.button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm group z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{ duration: 0.4 }}
          className="w-5 h-5"
        >
          {isDark ? (
            <Sun className="w-full h-full text-yellow-300 drop-shadow-md" />
          ) : (
            <Moon className="w-full h-full text-gray-300 drop-shadow-md" />
          )}
        </motion.div>
      </motion.button>

      <div className="w-full max-w-6xl">
        {/* 🔹 Étapes en haut — centrées, avec icônes sous les titres */}
        <div className="mb-8">
          <div className="flex justify-between mb-6">
            {steps.map((s, i) => {
              const Icon = stepIcons[s];
              const isActive = step === s;
              const isCompleted = i < currentStepIndex;
              const color = isCompleted
                ? 'bg-white text-blue-600'
                : isActive
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-400';

              return (
             <motion.div
  key={s}
  className="flex flex-col items-center flex-1 relative"
  initial={false}
  animate={{ scale: isActive ? 1.08 : 1 }}
  transition={{ type: "spring", stiffness: 220, damping: 18 }}
>

  {/* 🔘 Cercle */}
  <div
    className={`
      relative w-12 h-12 rounded-full flex items-center justify-center
      transition-all duration-300
      ${isCompleted
        ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
        : isActive
        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
        : 'bg-white/5 text-gray-400 backdrop-blur-sm'}
    `}
  >

    {/* 💧 Effet actif (pulse doux) */}
    {isActive && (
      <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
    )}

    <Icon className="w-5 h-5 z-10" />

    {/* ✅ Badge completed */}
    {isCompleted && (
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-emerald-400 shadow">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    )}
  </div>

  {/* 📝 Titre */}
  <span
    className={`
      mt-3 text-sm font-semibold transition-colors
      ${isActive
        ? 'text-white'
        : isCompleted
        ? 'text-emerald-300'
        : 'text-gray-400'}
    `}
  >
    {stepTitles[s]}
  </span>

  {/* 🔹 Ligne */}
  <motion.div
    className="mt-2 h-[3px] w-14 rounded-full"
    animate={{
      backgroundColor: isCompleted
        ? '#34d399'
        : isActive
        ? '#22d3ee'
        : 'rgba(255,255,255,0.1)',
      scaleX: isActive ? 1.2 : 1
    }}
    transition={{ duration: 0.3 }}
  />

</motion.div>
              );
            })}
          </div>

          {/* 🔹 Barre de progression fluide - effet eau qui coule */}
<div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
  <motion.div 
    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 relative overflow-hidden"
    initial={{ width: '0%' }}
    animate={{ width: `${((currentStepIndex) / 1) * 100}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {/* Effet de brillance / eau qui coule */}
    <motion.div
      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 0.5
      }}
      style={{ skewX: '-20deg' }}
    />
  </motion.div>
</div>
        </div>

        {/* 🔹 Formulaire horizontal */}
        <div className="flex justify-center">
  <motion.div
    key={step}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full max-w-3xl"
  >
            <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
              {/* 🔹 Bandeau supérieur décoratif */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              
              {/* 🔹 Glow interne */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
              
              {/* 🔹 Titre + icône centrés */}
              <div className="relative p-7 md:p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-cyan-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  {step === 'email' && <Mail className="w-8 h-8 text-cyan-300" />}
                  {step === 'security' && <Lock className="w-8 h-8 text-cyan-300" />}
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3 text-center">
                  {stepTitles[step]}
                </h1>
                <p className="text-gray-300 text-sm text-center max-w-md mx-auto">
                  {step === 'email' && t('auth.signup.email_desc')}
                  {step === 'security' && t('auth.signup.security_desc')}
                </p>
              </div>

              {/* 🔹 Badge sécurité */}
              {step === 'security' && <SecurityBadge />}

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-7 mb-5 p-3.5 rounded-xl bg-amber-900/30 border border-amber-500/30 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4.5 h-4.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-200 text-sm font-medium mb-0.5">Erreur d'inscription</p>
                      <p className="text-amber-100/80 text-[13px]">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-7 mb-5 p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-emerald-200 text-sm font-medium mb-0.5">Compte créé !</p>
                      <p className="text-emerald-100/80 text-[13px]">{success}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5 px-7 pb-7">

{/* 🔹 ÉTAPE 2 : Email */}
{step === 'email' && (
  <div>
    <Label htmlFor="email" className="text-gray-300 mb-2 flex items-center gap-2">
      <Mail className="w-4 h-4 text-cyan-400" />
      {t('auth.signup.email')}
    </Label>
    <div className="relative">
      <Input
  ref={emailInputRef}
  id="email"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  onBlur={() => setEmailTouched(true)}
  placeholder="votre@email.com"
  className="..."
/>
      {/* Indicateur à droite plus visible */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {checkingEmail && (
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        )}
        {!checkingEmail && emailExists && (
          <div className="flex items-center gap-1.5">
            <X className="w-5 h-5 text-rose-400" />
            <span className="text-[11px] font-medium text-rose-300 hidden sm:inline">Déjà utilisé</span>
          </div>
        )}
        {!checkingEmail && !emailExists && formData.email && isValidEmail && (
          <Check className="w-5 h-5 text-emerald-400" />
        )}
      </div>
    </div>
    
    {/* Messages d’erreur / succès sous le champ */}
{emailExists && (
  <motion.p
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-[13px] text-rose-400 mt-2 flex items-center gap-1.5 font-medium"
  >
    <AlertCircle className="w-3.5 h-3.5" />
    {t('auth.signup.email_exists')}
  </motion.p>
)}
{emailTouched && !isValidEmail && formData.email && !emailExists && (
  <p className="text-[13px] text-amber-400 mt-2 flex items-center gap-1.5">
    <AlertCircle className="w-3.5 h-3.5" />
    {t('auth.signup.error_email_format')}
  </p>
)}
{!checkingEmail && !emailExists && isValidEmail && formData.email && (
  <motion.p
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-[13px] text-emerald-400 mt-2 flex items-center gap-1.5"
  >
    <Check className="w-3.5 h-3.5" />
    Email disponible
  </motion.p>
)}
  </div>
)}

                {/* 🔹 ÉTAPE 3 : Sécurité (simplifiée) */}
{step === 'security' && (
  <>
    <div>
      <Label htmlFor="password" className="text-gray-300 mb-2 flex items-center gap-2">
        <Lock className="w-4 h-4 text-cyan-400" />
        {t('auth.signup.password')}
      </Label>
      <div className="relative">
        <Input
          ref={passwordInputRef}
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="pl-4 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300 transition-colors p-1"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Message simplifié : seulement si trop court */}
      {formData.password && !isPasswordLengthValid && (
        <p className="text-[13px] text-amber-400 mt-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Le mot de passe doit contenir au moins 6 caractères
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="passwordConfirm" className="text-gray-300 mb-2 flex items-center gap-2">
        <Lock className="w-4 h-4 text-cyan-400" />
        {t('auth.signup.password_confirm')}
      </Label>
      <div className="relative">
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="••••••••"
          className="pl-4 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300 transition-colors p-1"
          aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {formData.passwordConfirm && !doPasswordsMatch && (
        <p className="text-[13px] text-amber-400 mt-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Les mots de passe ne correspondent pas
        </p>
      )}
    </div>

    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3.5 text-[13px] text-blue-200">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          <span className="font-medium">Authentification à deux facteurs activée</span> par défaut pour sécuriser votre compte.
        </span>
      </div>
    </div>
  </>
)}
 </div>

              {/* 🔹 Navigation */}
              <div className="mt-8 pt-6 border-t border-white/10 px-7 pb-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  
                  <Button
                    type="button"
                    onClick={
                      step === 'email' ? handleNextEmail :
                      handleSignUp
                    }
                    disabled={isNextDisabled() || loading}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t('auth.signup.creating')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {step !== 'security' ? (
                          <>
                            {t('auth.signup.next')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                            {t('auth.signup.create_account')}
                          </>
                        )}
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center pt-4 border-t border-white/5">
                  <p className="text-gray-300 text-sm">
                    {t('auth.signup.already_have_account')}{' '}
                    <Link 
                      href="/auth/sign-in" 
                      className="text-cyan-300 hover:text-cyan-200 font-bold hover:underline transition-colors flex items-center justify-center gap-1.5 group inline-block"
                    >
                      <span>{t('auth.signup.sign_in')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </p>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
                    <Link href="/privacy" className="hover:text-cyan-300 transition-colors">Confidentialité</Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-cyan-300 transition-colors">Conditions</Link>
                    <span>•</span>
                    <Link href="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
                  </div>
                </div>
                
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* 🔹 Modal de bienvenue */}
      <AnimatePresence>
        {showWelcomeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowWelcomeModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-white/15 shadow-2xl shadow-black/60 w-full max-w-md overflow-hidden">
                <FloatingBubbles />
                
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 text-gray-300 hover:text-white z-10 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-7 py-10 text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="text-7xl mb-5"
                  >
                    🎉
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3"
                  >
                    Bienvenue sur LUVIKA !
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-200 text-lg max-w-xs mx-auto mb-6"
                  >
                    Votre compte a été créé avec succès. Vérifiez votre email pour activer votre compte et commencer à créer votre identité numérique.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                  >
                    <Button 
                      onClick={() => setShowWelcomeModal(false)}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20"
                    >
                      Commencer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowWelcomeModal(false);
                        router.push('/auth/sign-in');
                      }}
                      className="border-white/20 text-gray-300 hover:bg-white/10 font-medium px-6 py-3 rounded-xl"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Vérifier mon email
                    </Button>
                  </motion.div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Sécurité renforcée</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-cyan-400" />
                        <span>Multi-plateforme</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkle className="w-3 h-3 text-yellow-400" />
                        <span>LUVIKA v2.1.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 🔹 Styles globaux */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 200% 100%;
        }
        
        @keyframes arrow-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-arrow-up {
          animation: arrow-up 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
