// src/app/auth/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Sparkle, ArrowLeft, Sun, Moon, 
  ShieldCheck, X, ArrowRight 
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { SiSocialblade } from 'react-icons/si';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.error.back_to_login': 'Retour à la connexion',
    'auth.error.title': 'Erreur d\'authentification',
    'auth.error.safe_return': 'Retour sécurisé vers la page de connexion',
    'auth.signin.submit': 'Retour à la connexion',
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
        className="absolute rounded-full bg-gradient-to-r from-amber-400/10 to-red-400/10"
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

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Une erreur est survenue.');
  const [isDark, setIsDark] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const errorId = useRef(Date.now().toString(36)).current;

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

  useEffect(() => {
    const msg = searchParams.get('message') || 'Une erreur inattendue est survenue.';
    setMessage(msg);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-900/5 to-red-900/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond dynamique premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(220,38,38,0.05),transparent_70%)]"></div>
      <FloatingBubbles />
      
      {/* 🔙 Retour accueil - Design premium */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-amber-300 transition-all group z-10"
      >
        <motion.div
          whileHover={{ x: -3 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">← {t('navbar.home')}</span>
          <span className="text-[10px] text-amber-400/80 hidden sm:block">Retour à l'accueil</span>
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
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-red-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
            {/* 🔹 Bandeau supérieur décoratif */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500"></div>
            
            <div className="relative p-7 md:p-8">
              {/* 🔹 Header avec logo LUVIKA */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-amber-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <SiSocialblade className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-red-300 mb-2">
                  {t('auth.error.title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-xs mx-auto">
                  Une erreur est survenue lors de l'authentification. Veuillez réessayer ou contacter le support si le problème persiste.
                </p>
                
                {/* 🔹 Badges de sécurité */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-[11px] py-0.5 px-2">
                    <ShieldCheck className="w-3 h-3 mr-0.5 inline" />
                    Sécurité renforcée
                  </Badge>
                  <Badge className="bg-red-500/15 text-red-300 border-red-500/25 text-[11px] py-0.5 px-2">
                    <X className="w-3 h-3 mr-0.5 inline" />
                    Erreur #{errorId}
                  </Badge>
                </div>
              </div>

              {/* 🔹 Message d'erreur détaillé */}
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-500/25"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-200 font-medium mb-1">Détails de l'erreur</p>
                      <p className="text-amber-100/90 text-sm break-words">{message}</p>
                      
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="mt-3 text-[13px] text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{showDetails ? 'Masquer' : 'Afficher'} les détails techniques</span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {showDetails && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg text-[12px] text-gray-300 font-mono max-h-32 overflow-y-auto">
                          <p>Timestamp: {new Date().toISOString()}</p>
                          <p>ID Erreur: {errorId}</p>
                          <p>URL: {window.location.href}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 🔹 Bouton d'action premium */}
              <Button
                onClick={() => router.push('/auth/sign-in')}
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
                  {t('auth.signin.submit')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              {/* 🔹 Section d'aide */}
              <div className="mt-7 pt-5 border-t border-white/10 text-center">
                <p className="text-gray-300 text-sm mb-3">
                  <span className="font-medium text-amber-300">Besoin d'aide ?</span> Notre équipe de support est disponible 24/7 pour vous aider.
                </p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
                  <Link href="/privacy" className="hover:text-amber-300 transition-colors">Confidentialité</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-amber-300 transition-colors">Conditions</Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-amber-300 transition-colors">Contact</Link>
                </div>
              </div>
              
              {/* 🔹 Footer carte */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300/90">
                  <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span>Plateforme sécurisée • Assistance immédiate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🔹 Signature */}
        <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkle className="w-3 h-3 text-amber-400 animate-pulse" />
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