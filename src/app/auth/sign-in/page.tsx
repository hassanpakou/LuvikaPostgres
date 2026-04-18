// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, X, Sun, Moon, 
  Sparkle, ShieldCheck, Smartphone, 
  CheckCircle, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { createClient } from '../../../../src/lib/supabase/client';
import { SiSocialblade } from 'react-icons/si';

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.signin.title': 'Connexion',
    'auth.signin.subtitle': 'Connectez-vous à votre compte LUVIKA.',
    'auth.signin.email': 'Email',
    'auth.signin.password': 'Mot de passe',
    'auth.signin.forgot_password': 'Mot de passe oublié ?',
    'auth.signin.submit': 'Se connecter',
    'auth.signin.connecting': 'Connexion en cours...',
    'auth.signin.no_account': 'Vous n\'avez pas de compte ?',
    'auth.signin.sign_up': 'S\'inscrire',
    'auth.signin.error_credentials': 'Email ou mot de passe incorrect.',
    'auth.welcome.title': 'Bienvenue !',
    'auth.welcome.message': 'Heureux de vous revoir parmi nous.',
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

// 🔹 Carte de sécurité
const SecurityBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-2.5 mb-4"
  >
    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-emerald-300">Sécurité renforcée</p>
      <p className="text-[10px] text-emerald-200/80 truncate">Chiffrement AES-256 • Protection anti-phishing</p>
    </div>
  </motion.div>
);

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Détection thème système
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    }
    
    passwordInputRef.current?.focus();
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (authError) throw authError;

// ✅ VÉRIFICATION COMPTE DÉSACTIVÉ
const { data: { user: loggedUser } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('deactivated')
  .eq('id', loggedUser?.id)
  .single();

if (profile?.deactivated) {
  await supabase.auth.signOut();
  setError('Ce compte a été désactivé. Contactez le support pour le réactiver.');
  setLoading(false);
  return;
}
      // Simuler un délai pour l'expérience utilisateur
      await new Promise(r => setTimeout(r, 400));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No session');

      setSuccess(true);
      
      // Redirection après succès
      setTimeout(() => {
        const role = session.user.user_metadata?.role;
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        setShowWelcomeModal(true);
      }, 800);

    } catch (err: any) {
      console.error('💥 Login failed:', err);
      setError(err.message === 'Invalid login credentials' 
        ? t('auth.signin.error_credentials') 
        : 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
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

      {/* 🔷 Card principale - Design Ultime */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative">
          {/* 🔹 Effet de brillance sur la carte */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
            {/* 🔹 Bandeau supérieur décoratif */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            
            <div className="relative p-7 md:p-8">
              {/* 🔹 Header avec logo LUVIKA */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-cyan-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <SiSocialblade className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl"></div>
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-2">
                  {t('auth.signin.title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-xs mx-auto">
                  {t('auth.signin.subtitle') || 'Connectez-vous à votre compte LUVIKA pour accéder à toutes vos fonctionnalités.'}
                </p>
                
                {/* 🔹 Badges de confiance */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[11px] py-0.5 px-2">
                    <Smartphone className="w-3 h-3 mr-0.5 inline" />
                    Multi-plateforme
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[11px] py-0.5 px-2">
                    <CheckCircle className="w-3 h-3 mr-0.5 inline" />
                    99.9% de disponibilité
                  </Badge>
                </div>
              </div>

              {/* 🔹 Badge sécurité */}
              <SecurityBadge />

              {/* 🔹 Messages d'état */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-amber-900/30 border border-amber-500/30 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4.5 h-4.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-200 text-sm font-medium mb-0.5">Erreur d'authentification</p>
                      <p className="text-amber-100/80 text-[13px]">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-emerald-200 text-sm font-medium mb-0.5">Connexion réussie !</p>
                      <p className="text-emerald-100/80 text-[13px]">Redirection vers votre tableau de bord...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🔹 Formulaire premium */}
              <form onSubmit={handleSubmit} className="space-y-4.5">
                {/* 🔹 Email */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 transition-colors group-focus-within:text-cyan-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Label htmlFor="email" className="sr-only">
                    {t('auth.signin.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-12 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300 group-hover:border-white/30"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* 🔹 Mot de passe */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 transition-colors group-focus-within:text-cyan-300">
                    <Lock className="w-5 h-5" />
                  </div>
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
                    className="pl-12 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-white rounded-xl transition-all duration-300 group-hover:border-white/30"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300 transition-colors p-1"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* 🔹 Mot de passe oublié */}
                <div className="flex items-center justify-between text-sm">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline transition-colors flex items-center gap-1.5 group"
                  >
                    <span>{t('auth.signin.forgot_password')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  
                  <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 text-[11px] py-0.5 px-2">
                    <Lock className="w-3 h-3 mr-0.5 inline" />
                    Sécurisé
                  </Badge>
                </div>

                {/* 🔹 Bouton login premium */}
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {t('auth.signin.connecting')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                      {t('auth.signin.submit')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              {/* 🔹 Inscription */}
              <div className="mt-7 pt-5 border-t border-white/10 text-center">
                <p className="text-gray-300 text-sm">
                  {t('auth.signin.no_account')}{' '}
                  <Link 
                    href="/auth/sign-up" 
                    className="text-cyan-300 hover:text-cyan-200 font-bold hover:underline transition-colors flex items-center justify-center gap-1.5 group inline-block mt-1"
                  >
                    <span>{t('auth.signin.sign_up')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </p>
                
                {/* 🔹 Lien vers conditions */}
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-[11px] text-gray-500">
                  <Link href="/privacy" className="hover:text-cyan-300 transition-colors">Confidentialité</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-cyan-300 transition-colors">Conditions</Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
                </div>
              </div>
            </div>
            
            {/* 🔹 Footer carte */}
            <div className="px-7 py-4 bg-white/3 border-t border-white/10">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-300/90">
                <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span>Connexion sécurisée • Données chiffrées</span>
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

      {/* 🔹 Modal d'accueil premium */}
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
                {/* Décoration intérieure */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
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
                    {t('auth.welcome.title')}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-200 text-lg max-w-xs mx-auto mb-6"
                  >
                    {t('auth.welcome.message') || 'Heureux de vous revoir parmi nous.'}
                  </motion.p>
                  
                
                  
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
      `}</style>
    </div>
  );
}

// 🔹 Icônes manquantes
import { ArrowRight, Settings } from 'lucide-react';
