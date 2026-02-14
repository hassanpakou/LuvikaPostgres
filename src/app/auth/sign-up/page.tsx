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
  CheckCircle, Zap, Crown, Building2, Settings
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { createClient } from '../../../lib/supabase/client';
import { SiSocialblade } from 'react-icons/si';

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.signup.plan_title': 'Choisissez votre plan',
    'auth.signup.identity_title': 'Informations personnelles',
    'auth.signup.email_title': 'Adresse email',
    'auth.signup.security_title': 'Sécurité',
    'auth.signup.plan_desc': 'Choisissez le plan qui correspond à vos besoins',
    'auth.signup.identity_desc': 'Remplissez vos informations personnelles',
    'auth.signup.email_desc': 'Entrez votre adresse email',
    'auth.signup.security_desc': 'Choisissez un mot de passe sécurisé',
    'auth.signup.full_name': 'Nom complet',
    'auth.signup.full_name_placeholder': 'Entrez votre nom complet',
    'auth.signup.username': 'Nom d\'utilisateur',
    'auth.signup.username_hint_plain': 'Votre nom d\'utilisateur sera: {username}',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Mot de passe',
    'auth.signup.password_confirm': 'Confirmez le mot de passe',
    'auth.signup.error_name': 'Le nom doit contenir au moins 2 caractères',
    'auth.signup.error_username': 'Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques',
    'auth.signup.error_email_format': 'Format d\'email invalide',
    'auth.signup.email_exists': 'Cet email est déjà utilisé',
    'auth.signup.check_email': '✅ Compte créé ! Vérifiez votre boîte mail.',
    'auth.signup.error_generic': 'Erreur lors de la création du compte',
    'auth.signup.back': 'Retour',
    'auth.signup.next': 'Suivant',
    'auth.signup.create_account': 'Créer le compte',
    'auth.signup.creating': 'Création en cours...',
    'auth.signup.already_have_account': 'Vous avez déjà un compte ?',
    'auth.signup.sign_in': 'Se connecter',
    'auth.signup.password_length': '8 caractères minimum',
    'auth.signup.password_uppercase': 'Une lettre majuscule',
    'auth.signup.password_lowercase': 'Une lettre minuscule',
    'auth.signup.password_number': 'Un chiffre',
    'auth.signup.password_special': 'Un caractère spécial',
    'auth.signup.password_match': 'Les mots de passe correspondent',
    'auth.signup.2fa_enabled': 'Authentification à deux facteurs activée',
    'pricing.plans.freemium.title': 'Freemium',
    'pricing.plans.freemium.desc': 'Pour les particuliers',
    'pricing.plans.premium.title': 'Professionnel',
    'pricing.plans.premium.desc': 'Pour les professionnels',
    'pricing.plans.entreprise.title': 'Entreprise',
    'pricing.plans.entreprise.desc': 'Pour les grandes entreprises',
    'pricing.plans.premium.popular': 'POPULAIRE',
    'LUVIKA': 'LUVIKA',
    'tagline': 'Votre identité digitale en un tap NFC',
    'admin.stats.total_users': 'Utilisateurs enregistrés',
    'navbar.home': 'Accueil',
    'auth.security': 'Sécurité de niveau bancaire',
    'auth.features': 'Accès à toutes vos fonctionnalités'
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
      <p className="text-[12px] font-bold text-emerald-300 flex items-center gap-1.5">
        <span>Sécurité renforcée</span>
        <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 text-[10px] py-0.5 px-1.5">
          <CheckCircle className="w-2.5 h-2.5 mr-0.5 inline" />
          AES-256
        </Badge>
      </p>
      <p className="text-[11px] text-emerald-200/80 mt-0.5">
        Chiffrement de bout en bout • Protection anti-phishing • Authentification à deux facteurs
      </p>
    </div>
  </motion.div>
);

type Step = 'plan' | 'identity' | 'email' | 'security';
type Plan = 'basic' | 'premium' | 'entreprise';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('plan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isDark, setIsDark] = useState(true);

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
    setStep('identity');
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
    if (step === 'identity') return !isValidName || !isValidUsername;
    if (step === 'email') return !isValidEmail || emailExists || checkingEmail;
    if (step === 'security') return !allPasswordRulesMet;
    return false;
  };

  const steps = ['plan', 'identity', 'email', 'security'] as Step[];
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
    plan: CreditCard,
    identity: User,
    email: Mail,
    security: Lock,
  };

  const stepTitles = {
    plan: t('auth.signup.plan_title'),
    identity: t('auth.signup.identity_title'),
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
        <motion.div
          whileHover={{ x: -3 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.div>
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
                  className="flex flex-col items-center flex-1"
                  initial={false}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${color} mb-3 relative shadow-lg`}>
                    <Icon className="w-5.5 h-5.5" />
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-emerald-500">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-200">{stepTitles[s]}</span>
                  <div className={`mt-1.5 h-0.5 w-16 rounded-full ${
                    isCompleted ? 'bg-emerald-500' : isActive ? 'bg-cyan-500' : 'bg-white/10'
                  }`} />
                </motion.div>
              );
            })}
          </div>

          {/* 🔹 Barre de progression fluide */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStepIndex) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* 🔹 Formulaire horizontal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🔹 Sidebar gauche — info + stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="text-center p-6 glass-border rounded-2xl bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-xl border border-white/15">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <SiSocialblade className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {t('LUVIKA')}
              </h3>
              <p className="text-gray-300 text-sm mt-2 max-w-xs mx-auto">
                {t('tagline')}
              </p>
              
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[11px] py-0.5 px-2">
                  <Smartphone className="w-3 h-3 mr-0.5 inline" />
                  NFC & QR
                </Badge>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[11px] py-0.5 px-2">
                  <CheckCircle className="w-3 h-3 mr-0.5 inline" />
                  99.9% uptime
                </Badge>
              </div>
            </div>

            <div className="p-5 glass-border rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-yellow-400 animate-pulse" />
                Pourquoi choisir LUVIKA ?
              </h4>
              <ul className="space-y-2.5 text-gray-300 text-sm">
                {[
                  { icon: Zap, text: 'Partagez en 1 tap NFC' },
                  { icon: Smartphone, text: 'Statistiques en temps réel' },
                  { icon: Crown, text: 'Multi-cartes pour pros' },
                  { icon: ShieldCheck, text: 'Sécurité de niveau bancaire' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 bg-white/3 rounded-lg hover:bg-white/5 transition-colors">
                    <item.icon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 glass-border rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-purple-500/20 text-center">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                1,248+
              </div>
              <div className="text-gray-300 font-medium mt-1">{t('admin.stats.total_users')}</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                <ArrowUp className="w-3 h-3" />
                +12% ce mois
              </div>
            </div>
          </motion.div>

          {/* 🔹 Formulaire principal — droite */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
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
                  {step === 'plan' && <CreditCard className="w-8 h-8 text-cyan-300" />}
                  {step === 'identity' && <User className="w-8 h-8 text-cyan-300" />}
                  {step === 'email' && <Mail className="w-8 h-8 text-cyan-300" />}
                  {step === 'security' && <Lock className="w-8 h-8 text-cyan-300" />}
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3 text-center">
                  {stepTitles[step]}
                </h1>
                <p className="text-gray-300 text-sm text-center max-w-md mx-auto">
                  {step === 'plan' && t('auth.signup.plan_desc')}
                  {step === 'identity' && t('auth.signup.identity_desc')}
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
                {/* 🔹 ÉTAPE 1 : Choix du plan */}
                {step === 'plan' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'basic', title: t('pricing.plans.freemium.title'), desc: t('pricing.plans.freemium.desc'), price: '0', icon: Zap },
                        { id: 'premium', title: t('pricing.plans.premium.title'), desc: t('pricing.plans.premium.desc'), price: '12', icon: Crown, popular: true },
                        { id: 'entreprise', title: t('pricing.plans.entreprise.title'), desc: t('pricing.plans.entreprise.desc'), price: '39', icon: Building2 }
                      ].map((plan) => {
                        const Icon = plan.icon;
                        const isSelected = formData.plan === plan.id;
                        const PlanIcon = getPlanIcon(plan.id as Plan);
                        
                        return (
                          <motion.div
                            key={plan.id}
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative overflow-hidden rounded-2xl group"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(plan.id as Plan)} opacity-10 group-hover:opacity-15 transition-opacity`} />
                            <button
                              type="button"
                              onClick={() => handlePlanSelect(plan.id as Plan)}
                              className={`w-full text-left p-6 rounded-2xl border-2 relative z-10 h-full flex flex-col justify-between transition-all duration-300 ${
                                isSelected
                                  ? plan.id === 'basic'
                                    ? 'border-green-500 bg-green-500/10'
                                    : plan.id === 'premium'
                                    ? 'border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30'
                                    : 'border-purple-500 bg-purple-500/10'
                                  : 'border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlanColor(plan.id as Plan)} flex items-center justify-center`}>
                                      <PlanIcon className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{plan.title}</h3>
                                  </div>
                                  {plan.popular && (
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-[10px] py-0.5 px-2 shadow-md shadow-amber-500/30">
                                      {t('pricing.plans.premium.popular')}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-300 text-sm mb-4">{plan.desc}</p>
                                
                                <div className="space-y-2 text-[13px] text-gray-300">
                                  {plan.id === 'basic' && (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                        <span>1 carte NFC</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                        <span>Profil de base</span>
                                      </div>
                                    </>
                                  )}
                                  {plan.id === 'premium' && (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Cartes NFC illimitées</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Analytics avancés</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Support prioritaire</span>
                                      </div>
                                    </>
                                  )}
                                  {plan.id === 'entreprise' && (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Gestion d'équipe</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Branding personnalisé</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-purple-400" />
                                        <span>API dédiée</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right mt-4 pt-4 border-t border-white/10">
                                <div className="text-3xl font-bold text-white">${plan.price}</div>
                                <div className="text-gray-400 text-sm">/mois</div>
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🔹 ÉTAPE 2 : Identité */}
                {step === 'identity' && (
                  <>
                    <div>
                      <Label htmlFor="full_name" className="text-gray-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        {t('auth.signup.full_name')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder={t('auth.signup.full_name_placeholder')}
                          className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                        />
                        {!isValidName && formData.full_name && (
                          <p className="text-[13px] text-amber-400 mt-1.5 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t('auth.signup.error_name')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-gray-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        {t('auth.signup.username')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="votre_nom"
                          className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                        />
                        <p className="text-[13px] text-gray-400 mt-1.5">
                          {t('auth.signup.username_hint_plain').replace('{username}', formData.username || 'votre_nom')}
                        </p>
                        {!isValidUsername && formData.username && (
                          <p className="text-[13px] text-amber-400 mt-1 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t('auth.signup.error_username')}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 🔹 ÉTAPE 3 : Email */}
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
                        placeholder="votre@email.com"
                        className="pl-4 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                      />
                      {checkingEmail && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <span className="animate-spin">· · ·</span>
                        </span>
                      )}
                      {emailExists && !checkingEmail && (
                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    {emailExists && (
                      <p className="text-[13px] text-amber-400 mt-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('auth.signup.email_exists')}
                      </p>
                    )}
                    {!isValidEmail && formData.email && !emailExists && (
                      <p className="text-[13px] text-amber-400 mt-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('auth.signup.error_email_format')}
                      </p>
                    )}
                  </div>
                )}

                {/* 🔹 ÉTAPE 4 : Sécurité */}
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
                      
                      {/* 🔹 Indicateur de force du mot de passe */}
                      <div className="mt-3 space-y-1.5">
                        {Object.entries(passwordRules).map(([key, valid]) => (
                          <div key={key} className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              valid ? 'bg-emerald-500 scale-110' : 'bg-gray-500'
                            }`} />
                            <span className={`text-[13px] transition-colors duration-300 ${
                              valid ? 'text-emerald-400 font-medium' : 'text-gray-400'
                            }`}>
                              {t(`auth.signup.password_${key}`)}
                            </span>
                          </div>
                        ))}
                      </div>
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
                  <div className="flex gap-3">
                    {step !== 'plan' && (
                      <Button
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        variant="outline"
                        className="border-white/20 text-gray-300 hover:bg-white/10 px-6 py-3 rounded-xl font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {t('auth.signup.back')}
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    onClick={
                      step === 'plan' ? () => {} : // Handled by plan selection
                      step === 'identity' ? handleNextIdentity :
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
                
                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-300/90">
                    <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                    <span>Chiffrement AES-256 • Données protégées</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 🔹 Signature */}
            <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
              <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🔹 Modal Entreprise */}
      <AnimatePresence>
        {showEnterpriseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowEnterpriseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-white/15 shadow-2xl shadow-black/60 w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <FloatingBubbles />
              
              <button
                onClick={() => setShowEnterpriseModal(false)}
                aria-label="Fermer"
                className="absolute top-4 right-4 text-gray-300 hover:text-white z-10 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="px-7 py-10 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 mb-3">
                  {t('pricing.plans.entreprise.title')}
                </h3>
                
                <p className="text-gray-200 text-lg max-w-xs mx-auto mb-6">
                  Ce plan n'est disponible que sur commande. Passez d'abord au plan <span className="text-cyan-400 font-bold">Professionnel</span>, puis contactez-nous pour une offre personnalisée.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowEnterpriseModal(false)}
                    className="border-white/20 text-gray-300 hover:bg-white/10 px-6 py-3 rounded-xl font-medium"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, plan: 'premium' }));
                      setShowEnterpriseModal(false);
                      setStep('identity');
                    }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    <Crown className="w-4 h-4 mr-1.5" />
                    Choisir Professionnel
                  </Button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Support dédié</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>Gestion d'équipe</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkle className="w-3 h-3 text-yellow-400" />
                      <span>Offre personnalisée</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

// 🔹 Icônes manquantes
import { ArrowUp, Users } from 'lucide-react';