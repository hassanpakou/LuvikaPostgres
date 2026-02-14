// src/app/auth/forgot-password/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, ArrowLeft, X, Check, Sun, Moon, 
  Sparkle, ShieldCheck, AlertCircle, ArrowRight,
  CheckCircle
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
    'auth.forgot_password.back_to_login': 'Retour à la connexion',
    'auth.forgot_password.title': 'Mot de passe oublié ?',
    'auth.forgot_password.subtitle': 'Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    'auth.forgot_password.email': 'Adresse email',
    'auth.forgot_password.email_placeholder': 'votre@email.com',
    'auth.forgot_password.submit': 'Envoyer le lien',
    'auth.forgot_password.success': '✅ Email envoyé ! Vérifiez votre boîte de réception.',
    'auth.forgot_password.error': '❌ Email non trouvé ou erreur serveur. Veuillez réessayer.',
    'auth.forgot_password.sending': 'Envoi en cours...',
    'auth.forgot_password.check_spam': 'Pensez à vérifier vos courriers indésirables.',
    'auth.security': 'Sécurité de niveau bancaire',
    'navbar.home': 'Accueil',
    'privacy': 'Confidentialité',
    'terms': 'Conditions',
    'contact': 'Contact'
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
        Chiffrement de bout en bout • Lien temporaire • Protection anti-phishing
      </p>
    </div>
  </motion.div>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isDark, setIsDark] = useState(true);
  const emailInputRef = useRef<HTMLInputElement>(null);

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
    
    // Auto-focus sur le champ email
    setTimeout(() => emailInputRef.current?.focus(), 100);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  // ✅ Validation email basique
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Envoi du lien de réinitialisation
  const handleSendReset = async () => {
    if (!isValidEmail) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (sendError) throw sendError;

      setSuccess(t('auth.forgot_password.success'));
      
      // Redirection après succès
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur reset:', err);
      setError(err.message?.includes('Invalid email') 
        ? 'Aucun compte trouvé avec cette adresse email' 
        : t('auth.forgot_password.error'));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gestion de la soumission par Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && isValidEmail) {
      handleSendReset();
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
          <span className="text-xs font-medium">← {t('auth.forgot_password.back_to_login')}</span>
          <span className="text-[10px] text-cyan-400/80 hidden sm:block">Retour à la connexion</span>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                  {t('auth.forgot_password.title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-xs mx-auto">
                  {t('auth.forgot_password.subtitle')}
                </p>
                
                {/* 🔹 Badges de confiance */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[11px] py-0.5 px-2">
                    <Mail className="w-3 h-3 mr-0.5 inline" />
                    Email sécurisé
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[11px] py-0.5 px-2">
                    <CheckCircle className="w-3 h-3 mr-0.5 inline" />
                    Lien temporaire
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
                      <p className="text-amber-200 text-sm font-medium mb-0.5">Erreur d'envoi</p>
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
                      <p className="text-emerald-200 text-sm font-medium mb-0.5">Email envoyé !</p>
                      <p className="text-emerald-100/80 text-[13px]">{t('auth.forgot_password.check_spam')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🔹 Formulaire premium */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendReset(); }} className="space-y-4.5">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 transition-colors group-focus-within:text-cyan-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Label htmlFor="email" className="sr-only">
                    {t('auth.forgot_password.email')}
                  </Label>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('auth.forgot_password.email_placeholder')}
                    className="pl-12 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300 group-hover:border-white/30"
                    autoComplete="email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isValidEmail}
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
                      {t('auth.forgot_password.sending')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Mail className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                      {t('auth.forgot_password.submit')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              {/* 🔹 Section d'aide */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-gray-300 text-sm mb-3">
                  <span className="font-medium text-cyan-300">Besoin d'aide ?</span> Contactez notre support si vous ne recevez pas d'email dans les 5 minutes.
                </p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
                  <Link href="/privacy" className="hover:text-cyan-300 transition-colors">Confidentialité</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-cyan-300 transition-colors">Conditions</Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
                </div>
              </div>
              
              {/* 🔹 Footer carte */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-300/90">
                  <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span>Email sécurisé • Lien valable 1h</span>
                </div>
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