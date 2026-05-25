'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

/**
 * Particle Background Component
 * Creates floating particles with motion animation
 */
export function ParticleBackground({
  particleCount = 20,
  colors = ['cyan-400', 'blue-400', 'indigo-400', 'cyan-300'],
  speed = 'medium',
  className = '',
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Generate particles only on client side
    const newParticles: Particle[] = Array.from({ length: particleCount }).map(
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 8 + 5,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    );
    setParticles(newParticles);
  }, [particleCount, colors]);

  if (!isMounted) return null;

  const speedMultiplier = {
    slow: 1.5,
    medium: 1,
    fast: 0.6,
  }[speed];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute bg-${particle.color} rounded-full mix-blend-screen filter blur-md opacity-60`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.cos(particle.id) * 50, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration * speedMultiplier,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Floating Spheres Component
 * Creates larger floating spheres for visual impact
 */
export function FloatingSpheres({
  count = 3,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  const spheres = Array.from({ length: count }).map((_, i) => {
    const positions = [
      { top: '10%', left: '10%', size: 300, delay: 0, color: 'cyan' },
      { top: '50%', right: '10%', size: 400, delay: 2, color: 'blue' },
      { bottom: '10%', left: '50%', size: 350, delay: 1, color: 'indigo' },
    ];
    return positions[i % positions.length];
  });

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {spheres.map((sphere, i) => (
        <motion.div
          key={i}
          className={`absolute w-${sphere.size} h-${sphere.size} bg-${sphere.color}-500/10 rounded-full mix-blend-screen filter blur-3xl`}
          style={{
            ...('top' in sphere && { top: sphere.top }),
            ...('bottom' in sphere && { bottom: sphere.bottom }),
            ...('left' in sphere && { left: sphere.left }),
            ...('right' in sphere && { right: sphere.right }),
            width: `${sphere.size}px`,
            height: `${sphere.size}px`,
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, Math.cos(i) * 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: sphere.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Mesh Gradient Background
 * Creates a mesh-like animated gradient
 */
export function MeshGradientBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900/10 to-slate-950" />

      {/* Animated mesh */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />
    </div>
  );
}
