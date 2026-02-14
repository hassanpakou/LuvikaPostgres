// src/app/auth/update-password/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../../src/lib/supabase/client';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { 
  Lock, CheckCircle, Sun, Moon, ArrowLeft, 
  AlertCircle, Eye, EyeOff, Sparkle, 
  ShieldCheck, ArrowRight, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SiSocialblade } from 'react-icons/si';

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.reset.title': 'Réinitialiser le mot de passe',
    'auth.reset.subtitle': 'Entrez votre nouveau mot de passe',
    'auth.reset.new_password': 'Nouveau mot de passe',
    'auth.reset.submit': 'Mettre à jour',
    'auth.reset.success_title': 'Mot de passe mis à jour !',
    'auth.reset.success_message': 'Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.',
    'auth.reset.verifying': 'Vérification en cours',
    'auth.reset.verifying_subtitle': 'Vérification du lien de réinitialisation...',
    'auth.reset.invalid_link': 'Lien invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.',
    'auth.reset.error_update': 'Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.',
    'auth.reset.back_to_login': 'Retour à la connexion',
    'auth.signin.submit': 'Se connecter',
    'auth.signup.password_length': '8 caractères minimum',
    'auth.signup.password_uppercase': 'Une lettre majuscule',
    'auth.signup.password_lowercase': 'Une lettre minuscule',
    'auth.signup.password_number': 'Un chiffre',
    'auth.signup.password_special': 'Un caractère spécial',
    'auth.signup.2fa_enabled': 'Authentification à deux facteurs activée',
    'navbar.home': 'Accueil'
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

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDark, setIsDark] = useState(true);
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

  // 🔹 Vérification du token au chargement
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
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery' as any,
        });

        if (verifyError) {
          console.error('Erreur OTP:', verifyError);
          throw new Error(t('auth.reset.invalid_link'));
        }

        // ✅ Token valide → on peut afficher le formulaire
        setLoading(false);
        setTimeout(() => passwordInputRef.current?.focus(), 100);
      } catch (err: any) {
        setError(err.message || t('auth.reset.invalid_link'));
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router]);

  // 🔹 Règles de validation du mot de passe
  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPasswordRulesMet) return;

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirection après succès
      setTimeout(() => {
        const nextParam = searchParams.get('next');
        const next = nextParam && nextParam.startsWith('/') ? nextParam : '/auth/sign-in';
        router.push(next);
      }, 2500);
    } catch (err: any) {
      setError(err.message || t('auth.reset.error_update'));
    }
  };

  // 🔹 États d'affichage
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
        <FloatingBubbles />

        <Link 
          href="/auth/sign-in" 
          className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-cyan-300 transition-all group z-10"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">← {t('auth.reset.back_to_login')}</span>
            <span className="text-[10px] text-cyan-400/80 hidden sm:block">Retour à la connexion</span>
          </div>
        </Link>

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
            
            <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              
              <div className="relative p-7 md:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-cyan-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <Lock className="w-8 h-8 text-cyan-300" />
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                  {t('auth.reset.verifying')}
                </h1>
                <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">
                  {t('auth.reset.verifying_subtitle')}
                </p>
                
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full"
                  />
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-300/90">
                    <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                    <span>Vérification sécurisée • Lien temporaire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
        <FloatingBubbles />

        <Link 
          href="/auth/sign-in" 
          className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-cyan-300 transition-all group z-10"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">← {t('auth.reset.back_to_login')}</span>
            <span className="text-[10px] text-cyan-400/80 hidden sm:block">Retour à la connexion</span>
          </div>
        </Link>

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
            
            <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              
              <div className="relative p-7 md:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-emerald-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <CheckCircle className="w-8 h-8 text-emerald-300" />
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 mb-3">
                  {t('auth.reset.success_title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">
                  {t('auth.reset.success_message')}
                </p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={() => router.push('/auth/sign-in')}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                    <span className="flex items-center justify-center gap-2">
                      {t('auth.signin.submit')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-300/90">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Connexion sécurisée • Données protégées</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
      <FloatingBubbles />
      
      <Link 
        href="/auth/sign-in" 
        className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-cyan-300 transition-all group z-10"
      >
        <motion.div
          whileHover={{ x: -3 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">← {t('auth.reset.back_to_login')}</span>
          <span className="text-[10px] text-cyan-400/80 hidden sm:block">Retour à la connexion</span>
        </div>
      </Link>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            
            <div className="relative p-7 md:p-8">
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-cyan-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <SiSocialblade className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-2">
                  {t('auth.reset.title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-md mx-auto">
                  {t('auth.reset.subtitle')}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3.5 rounded-xl bg-amber-900/30 border border-amber-500/30 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4.5 h-4.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-200 text-sm font-medium mb-0.5">Lien invalide</p>
                      <p className="text-amber-100/80 text-[13px]">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <SecurityBadge />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="password" className="text-gray-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    {t('auth.reset.new_password')}
                  </Label>
                  <div className="relative">
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-4 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                      required
                      minLength={8}
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
                  <div className="mt-4 space-y-2">
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

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3.5 text-[13px] text-blue-200">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium">Authentification à deux facteurs</span> activée par défaut pour sécuriser votre compte.
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!allPasswordRulesMet}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                    {t('auth.reset.submit')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </form>

              <div className="mt-7 pt-5 border-t border-white/10 text-center">
                <p className="text-gray-300 text-sm">
                  <Link 
                    href="/auth/sign-in" 
                    className="text-cyan-300 hover:text-cyan-200 font-bold hover:underline transition-colors flex items-center justify-center gap-1.5 group inline-block"
                  >
                    <span>{t('auth.reset.back_to_login')}</span>
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
        </div>
        
        <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
        </div>
      </motion.div>
      
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
      `}</style>
    </div>
  );
}