// src/components/BackgroundCyberpunk.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundCyberpunk() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Détection prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', (e) => {
      setPrefersReducedMotion(e.matches);
    });

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', (e) => {});
    };
  }, []);

  // Désactiver si mobile ou prefers-reduced-motion
  if (isMobile || prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 🔵 Grille Cyberpunk */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, white 0%, transparent 70%)'
          }}
        />
      </div>

      {/* 🟢 Ligne de Scan Horizontal */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{
          y: ['0%', '100%'],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
        initial={{ y: '0%' }}
      />

      {/* 🟣 Particules Flottantes */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: i % 3 === 0 
                ? '0 0 10px #6366f1, 0 0 20px #6366f1' 
                : i % 3 === 1 
                ? '0 0 10px #8b5cf6, 0 0 20px #8b5cf6' 
                : '0 0 10px #22d3ee, 0 0 20px #22d3ee',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* 🟡 Lignes de Code Défilantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-full flex">
          {[...Array(4)].map((_, col) => (
            <div 
              key={col} 
              className="w-1/4 overflow-hidden"
              style={{ animation: `codeScroll ${15 + col * 2}s linear infinite` }}
            >
              <div className="space-y-1 text-xs font-mono opacity-15">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="text-cyan-400/50 pl-2">
                    {i % 7 === 0 ? `// ${['SYSTEM', 'SECURITY', 'NETWORK', 'DATA', 'ACCESS', 'LOG'][Math.floor(Math.random() * 6)]} ${Math.floor(Math.random() * 9999)}` :
                     i % 5 === 0 ? `const ${['user', 'data', 'token', 'session', 'config'][Math.floor(Math.random() * 5)]} = ${Math.random().toFixed(4)};` :
                     `0x${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔴 Réseau de Connexions */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          {[...Array(10)].map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <motion.line
                key={i}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#6366f1"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 8 + Math.random() * 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* ⚡ Effet Glitch sur les Bords */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            backgroundImage: 'linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '3px 100%',
            animation: 'glitchMove 0.5s steps(20) infinite'
          }}
        />
        <div 
          className="absolute inset-0 opacity-3"
          style={{ 
            backgroundImage: 'linear-gradient(0deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '100% 4px',
            animation: 'glitchMoveY 0.8s steps(15) infinite'
          }}
        />
      </div>

      {/* 🌈 Brume Colorée */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent" />
    </div>
  );
}