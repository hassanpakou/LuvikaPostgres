// src/app/(auth)/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script'; // ✅ IMPORT OBLIGATOIRE POUR NEXT/SCRIPT

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 🔹 Google Analytics - Intégration propre avec Next.js Script */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC" // ✅ ESPACES SUPPRIMÉS
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RYQBRH3CZC'); // ✅ ESPACES SUPPRIMÉS
          `,
        }}
      />

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* 🔹 Arrière-plan animé */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-cyan-900/5 to-indigo-900/10"></div>
          
          {/* Bulles flottantes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-white/5 animate-float"
              style={{
                width: `${8 + Math.random() * 24}px`,
                height: `${8 + Math.random() * 24}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${15 + i * 0.5}s`,
              }}
            />
          ))}

          {/* Particules scintillantes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.2}s`,
                opacity: 0.7,
              }}
            />
          ))}

          {/* Watermark LUVIKA */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            {[...Array(6)].map((_, row) => (
              <div key={row} className="flex justify-center" style={{ marginTop: `${row * 20}%` }}>
                {[...Array(8)].map((_, col) => (
                  <motion.div
                    key={`${row}-${col}`}
                    className="text-6xl font-bold text-white/10 mx-8 select-none"
                    style={{
                      transform: 'rotate(-15deg)',
                      textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 8 + row * 2,
                      repeat: Infinity,
                      delay: row * 0.5 + col * 0.3,
                    }}
                  >
                    LUVIKA
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex-1">
          {children}
        </div>
      </div>
    </>
  );
}