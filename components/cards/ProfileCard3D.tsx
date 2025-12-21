// src/components/cards/ProfileCard3D.tsx
// Carte 3D animée avec Framer Motion (tilt + hover glow)

'use client';

import { motion } from 'framer-motion';

export default function ProfileCard3D() {
  return (
    <motion.div
      className="glass-border overflow-hidden relative w-full aspect-[3/4] max-w-md mx-auto"
      whileHover={{ 
        scale: 1.03,
        rotateX: 5,
        rotateY: 5,
        boxShadow: '0 20px 40px rgba(0,150,255,0.3)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Fond dégradé + bruit subtil */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-indigo-900/50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Badge "Verified" */}
      <div className="absolute top-4 right-4 bg-green-500 text-xs font-bold px-2 py-1 rounded-full text-white z-10">
        ✅ Verified
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-white">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold">N</span>
        </div>
        <h3 className="text-2xl font-bold">Nestor PHAKU</h3>
        <p className="text-blue-200 mt-2">Développeur Full Stack</p>
        <p className="text-sm text-gray-300 mt-1">luvika.me/nestor</p>

        {/* QR Code placeholder (à générer dynamiquement plus tard) */}
        <div className="mt-6 w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">QR</span>
        </div>
      </div>

      {/* Effet glow au bord */}
      <div className="absolute inset-0 rounded-xl -z-10 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.6)',
        }}
      />
    </motion.div>
  );
}