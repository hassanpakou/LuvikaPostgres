// src/components/CRTOverlay.tsx
'use client';

import { useEffect, useState } from 'react';

export default function CRTOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', (e) => {
      setPrefersReducedMotion(e.matches);
    });

    return () => {
      mediaQuery.removeEventListener('change', (e) => {});
    };
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* 📺 Effet CRT (lignes horizontales) */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1.5px,
              rgba(0, 0, 0, 0.05) 1.5px,
              rgba(0, 0, 0, 0.05) 3px
            )
          `,
          opacity: 0.08,
          zIndex: 1,
        }}
      />

      {/* 📡 Bruit/Grain subtil */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 35%, rgba(255, 255, 255, 0.02) 0%, transparent 20%),
            radial-gradient(circle at 80% 65%, rgba(255, 255, 255, 0.02) 0%, transparent 20%)
          `,
          opacity: 0.3,
          zIndex: 2,
        }}
      />

      {/* ✨ Scintillement subtil */}
      <div 
        className="fixed inset-0 pointer-events-none animate-flicker"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          zIndex: 3,
        }}
      />
    </>
  );
}