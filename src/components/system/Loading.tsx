// src/components/system/Loading.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Scan, Database, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function Loading() {
  // Messages de chargement dynamiques
  const loadingMessages = [
    "Initialisation sécurisée...",
    "Chargement de votre profil...",
    "Vérification des permissions...",
    "Récupération des données...",
    "Préparation de l'interface...",
    "Connexion à la base de données...",
    "Optimisation de l'expérience..."
  ];
  
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/5 to-indigo-900/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond animé subtil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
        
        {/* Particules flottantes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)',
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, Math.sin(i) * 20, 0],
              scale: [0.9, 1.1, 0.9],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* 🔹 Carte glassmorphism premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-border rounded-3xl p-7 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/40 relative overflow-hidden"
        >
          {/* 🔹 Décoration intérieure */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl opacity-0 animate-pulse-slow"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* 🔹 Logo LUVIKA animé */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="relative w-24 h-24 mb-6"
            >
              {/* Cercle externe pulsant */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
              ></motion.div>
              
              {/* Cercle intermédiaire tournant */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full border-2 border-dashed border-blue-400/40"
              ></motion.div>
              
              {/* Centre lumineux */}
              <div className="absolute inset-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <Scan className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
              
              {/* Particules flottantes autour du logo */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-cyan-300/70"
                  style={{ 
                    top: `${30 + Math.sin(i) * 20}%`, 
                    left: `${30 + Math.cos(i) * 20}%` 
                  }}
                  animate={{
                    y: [0, -10, 0],
                    x: [0, Math.sin(i * 2) * 15, 0],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </motion.div>
            
            {/* 🔹 Titre avec gradient */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-2"
            >
              LUVIKA
            </motion.h3>
            
            {/* 🔹 Message de chargement dynamique */}
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-300 mb-1 text-sm font-medium"
            >
              {loadingMessages[currentMessageIndex]}
            </motion.p>
            
            {/* 🔹 Sous-titre */}
            <p className="text-gray-400 text-xs mb-6 max-w-xs">
              Récupération sécurisée des données depuis notre infrastructure cloud
            </p>
            
            {/* 🔹 Barre de progression premium */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: ["0%", "25%", "50%", "75%", "100%"] }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </motion.div>
              
              {/* 🔹 Points de progression */}
              <div className="absolute inset-0 flex justify-between items-center px-1.5 pointer-events-none">
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      percent <= (currentMessageIndex + 1) * 20 
                        ? 'bg-cyan-400' 
                        : 'bg-white/20'
                    }`}
                    animate={{ scale: percent <= (currentMessageIndex + 1) * 20 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: percent <= (currentMessageIndex + 1) * 20 ? Infinity : 0 }}
                  />
                ))}
              </div>
            </div>
            
            {/* 🔹 Statut de sécurité */}
            <div className="flex items-center gap-2 text-xs text-cyan-300/90 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
              <span>Connexion sécurisée • Chiffrement AES-256</span>
            </div>
            
            {/* 🔹 Badges de statut */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                { icon: Database, label: "Base de données", status: "Connecté" },
                { icon: ShieldCheck, label: "Sécurité", status: "Active" },
                { icon: Scan, label: "API", status: "Opérationnelle" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-1.5 text-[11px] bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
                >
                  <item.icon className="w-3 h-3 text-cyan-400" />
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-emerald-400 font-medium">{item.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* 🔹 Signature LUVIKA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5"
        >
          <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
        </motion.div>
      </div>
      
      {/* 🔹 Styles globaux pour les animations */}
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
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}