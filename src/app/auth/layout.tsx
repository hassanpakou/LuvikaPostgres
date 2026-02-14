// src/app/auth/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  
  // 🔹 Particules optimisées (moins nombreuses, plus performantes)
  const particleCount = shouldReduceMotion ? 4 : 8;
  const sparkleCount = shouldReduceMotion ? 2 : 5;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900/5 to-indigo-900/10">
      {/* 🔹 Arrière-plan animé optimisé */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Dégradé de base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
        
        {/* Particules flottantes optimisées */}
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, Math.sin(i) * 20, 0],
              scale: [0.9, 1.1, 0.9],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 10 + i * 1.5,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Étoiles scintillantes subtiles */}
        {[...Array(sparkleCount)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 3,
              repeat: shouldReduceMotion ? 0 : Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Cercle de lumière subtil */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.03)_0%,_transparent_70%)] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-1">
        {children}
      </div>
      
      {/* 🔹 Signature discrète */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-600 flex items-center gap-1 pointer-events-none">
        <span>•</span>
        <span>Fait avec ❤️ à Kinshasa</span>
        <span>•</span>
      </div>
    </div>
  );
}