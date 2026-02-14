// src/app/not-found.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Home, ArrowLeft, AlertCircle, Search, 
  Sparkle, Rocket, Zap, Scan, 
  Database, ShieldCheck, Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [is404Animating, setIs404Animating] = useState(true);
  
  useEffect(() => {
    // Arrêter l'animation après 3 secondes
    const timer = setTimeout(() => setIs404Animating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-900/5 to-indigo-900/10 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond animé premium */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
        
        {/* Particules flottantes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 30, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-2xl mx-auto px-4">
        {/* 🔹 Animation 404 premium */}
        <div className="relative mb-8">
          {/* 🔹 Cercle décoratif */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="absolute -inset-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"
          ></motion.div>
          
          {/* 🔹 Chiffres 404 animés */}
          <div className="relative z-10 flex justify-center gap-3">
            {[4, 0, 4].map((num, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotate: -10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  rotate: is404Animating ? [0, -5, 5, -5, 0] : 0 
                }}
                transition={{ 
                  delay: 0.3 + i * 0.1,
                  duration: is404Animating ? 0.5 : 0,
                  repeat: is404Animating ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400"
              >
                {num}
              </motion.div>
            ))}
          </div>
          
          {/* 🔹 Icône d'erreur */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* 🔹 Titre et description */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Page non trouvée
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 mb-10 max-w-md mx-auto leading-relaxed"
        >
          La page que vous cherchez n'existe pas ou a été déplacée. 
          <br className="hidden sm:block" />
          Ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin.
        </motion.p>
        
        {/* 🔹 Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {/* 🔹 Bouton Retour */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-medium transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour à la page précédente</span>
          </motion.button>

          {/* 🔹 Bouton Accueil */}
          <Link href="/">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group">
              <Home className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        
        {/* 🔹 Section suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-border rounded-2xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 max-w-xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Suggestions utiles</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "Accéder au Tableau de bord", href: "/dashboard" },
              { icon: Scan, label: "Explorer les fonctionnalités NFC", href: "/features" },
              { icon: Database, label: "Voir nos offres et tarifs", href: "/pricing" },
              { icon: ShieldCheck, label: "Consulter la documentation", href: "/documentation" }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 5 }}
                className="group"
              >
                <Link
                  href={item.href}
                  className="flex items-start gap-3 p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* 🔹 Section contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-400 text-sm mb-3">
            ℹ️ Si vous pensez que c'est une erreur,
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium group"
          >
            <span>Contactez notre support technique</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        
        {/* 🔹 Signature et badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-gray-500 pt-6 border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Globe, label: "Disponible en 9 langues" },
              { icon: ShieldCheck, label: "Sécurité de niveau bancaire" },
              { icon: Rocket, label: "99.9% de disponibilité" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <badge.icon className="w-3 h-3 text-cyan-400" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* 🔹 Styles globaux */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-custom {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

// 🔹 Icône manquante
import { ArrowRight } from 'lucide-react';