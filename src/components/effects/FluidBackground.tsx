// src/components/effects/FluidBackground.tsx
'use client';

import React from 'react';

const ORBS = [
  { color: 'hsla(200, 60%, 80%, 0.15)', size: '25vw', left: '15%', top: '15%', duration: 26, delay: 0 },
  { color: 'hsla(260, 50%, 85%, 0.12)', size: '30vw', left: '70%', top: '10%', duration: 30, delay: -5 },
  { color: 'hsla(330, 60%, 82%, 0.14)', size: '28vw', left: '40%', top: '65%', duration: 28, delay: -10 },
  { color: 'hsla(40, 60%, 82%, 0.14)',  size: '32vw', left: '75%', top: '70%', duration: 24, delay: -7 },
  { color: 'hsla(170, 50%, 80%, 0.13)', size: '26vw', left: '5%',  top: '80%', duration: 32, delay: -3 },
  { color: 'hsla(190, 70%, 85%, 0.16)', size: '35vw', left: '85%', top: '35%', duration: 27, delay: -12 },
];

export default function FluidBackground() {
  return (
    <>
      <style jsx global>{`
        @keyframes fluidMove {
          0% {
            transform: translate(0%, 0%) scale(0.9);
            opacity: 0.3;
          }
          20% {
            transform: translate(2vw, -1vh) scale(1.05);
            opacity: 0.55;
          }
          40% {
            transform: translate(-1vw, 1.5vh) scale(0.95);
            opacity: 0.45;
          }
          60% {
            transform: translate(-2vw, -0.5vh) scale(1.02);
            opacity: 0.55;
          }
          80% {
            transform: translate(1vw, 1vh) scale(0.98);
            opacity: 0.45;
          }
          100% {
            transform: translate(0%, 0%) scale(0.9);
            opacity: 0.3;
          }
        }
        .fluid-orb {
          animation: fluidMove ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -2 }}>
        {/* Fond légèrement teinté pour adoucir le blanc pur */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdfbf9] via-[#f9fafb] to-[#f5f7fa]" style={{ zIndex: -1 }} />

        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full fluid-orb"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle at 50% 50%, ${orb.color}, transparent 70%)`,
              filter: 'blur(80px)',
              left: orb.left,
              top: orb.top,
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}