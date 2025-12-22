// src/components/cards/ProfileCard3D.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ProfileCard3D() {
  const [isHovered, setIsHovered] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  // Déclenche un éclair toutes les 8s (effet naturel)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlashKey(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Déclenche un éclair au survol
  const handleHover = () => {
    setIsHovered(true);
    setTimeout(() => setIsHovered(false), 600);
  };

  return (
    <motion.div
      className="
        relative
        w-full
        max-w-[520px]
        aspect-[16/9]
        mx-auto
        rounded-2xl
        glass-border
        overflow-hidden
        cursor-pointer
      "
      // ✅ Rotation continue subtile (comme une carte flottante)
      animate={{
        rotateX: [0, 1.5, 0, -1, 0],
        rotateY: [0, -1, 0, 1, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.04,
        rotateX: 0,
        rotateY: 0,
        y: -6,
        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)',
      }}
      onHoverStart={handleHover}
      onHoverEnd={() => setIsHovered(false)}
      style={{ 
        perspective: 1400,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Fond dynamique */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-blue-900 via-blue-900/30 to-black" />
      
      {/* Éclats de lumière (simule des reflets réels) */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-cyan-400/10 blur-xl"
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-blue-300/10 blur-xl"
        animate={{ 
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />

      {/* ✨ Éclair stylisé (tonnerre doux) — apparaît au survol ou aléatoirement */}
      <AnimatePresence>
        {(isHovered || flashKey % 3 === 0) && (
          <motion.div
            key={flashKey}
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.15, 0.05, 0.2, 0],
              scale: [1, 1.1, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Éclair central (forme stylisée de foudre) */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute w-0.5 h-8 bg-cyan-200/80 -top-4 left-0 rotate-12 origin-top" />
              <div className="absolute w-0.5 h-6 bg-cyan-200/80 top-2 left-0 -rotate-6 origin-top" />
              <div className="absolute w-0.5 h-4 bg-cyan-200/80 top-6 left-0 rotate-8 origin-top" />
            </div>
            
            {/* Glow radial */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verre avant (glass effect renforcé) */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border border-white/10" />

      {/* Badge Verified */}
      <span className="absolute top-4 right-4 text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 z-10 flex items-center gap-1">
        <span>⚡</span> Verified
      </span>

      {/* Contenu */}
      <div className="relative z-10 h-full flex items-center justify-between px-8">
        {/* Identité */}
        <motion.div
          animate={{ 
            y: [0, -3, 0],
            x: [0, 1, 0, -1, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            LUVIKA
          </h2>
          <p className="mt-1 text-sm text-cyan-200/90">
            Révèle qui tu es
          </p>
          <p className="mt-2 text-xs font-mono text-gray-300 tracking-wider">
            luvika.me/vika
          </p>
        </motion.div>

        {/* QR Code stylisé */}
        <motion.div
          className="
            w-28 h-28
            rounded-xl
            bg-gradient-to-br from-cyan-400/10 to-blue-500/10
            border border-cyan-300/40
            backdrop-blur-md
            flex items-center justify-center
            shadow-lg
            overflow-hidden
          "
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 0.5, 0, -0.5, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          {/* Mini QR pattern */}
          <div className="grid grid-cols-3 gap-1">
            {Array(9).fill(0).map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-sm ${
                  [0, 2, 6, 8].includes(i)
                    ? 'bg-cyan-300'
                    : i === 4
                    ? 'bg-blue-300'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ombre dynamique */}
      <motion.div
        className="absolute -inset-1 rounded-[18px] pointer-events-none"
        animate={{
          boxShadow: [
            'inset 0 0 24px rgba(59,130,246,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)',
            'inset 0 0 36px rgba(59,130,246,0.15), 0 25px 50px -12px rgba(0,0,0,0.6)',
            'inset 0 0 24px rgba(59,130,246,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}