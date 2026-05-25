'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'orbs' | 'combined';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * Animated Background Component
 * Provides multiple animation styles for the background
 */
export function AnimatedBackground({
  variant = 'combined',
  intensity = 'medium',
  className = '',
}: AnimatedBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const getIntensityValues = () => {
    switch (intensity) {
      case 'low':
        return { duration: 12, delay: 0.5 };
      case 'high':
        return { duration: 5, delay: 0 };
      default:
        return { duration: 8, delay: 0.2 };
    }
  };

  const { duration, delay } = getIntensityValues();

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Gradient Shift Background */}
      {(variant === 'gradient' || variant === 'combined') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900/20 to-indigo-900/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: duration * 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      )}

      {/* Orbs (Glowing Circles) */}
      {(variant === 'orbs' || variant === 'combined') && (
        <>
          {/* Orb 1 - Cyan */}
          <motion.div
            className="absolute top-0 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
          />

          {/* Orb 2 - Blue */}
          <motion.div
            className="absolute top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: duration * 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay * 1.5,
            }}
          />

          {/* Orb 3 - Indigo */}
          <motion.div
            className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay * 2,
            }}
          />
        </>
      )}

      {/* Waves */}
      {(variant === 'waves' || variant === 'combined') && (
        <>
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: duration * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
          />
        </>
      )}

      {/* Grid Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}

/**
 * Background Gradient Shift Animation
 * Used for profile pages
 */
export function BackgroundGradientShift() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-cyan-900/20 to-blue-900/10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          y: [0, 40, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}

/**
 * Dashboard Background Animation
 * Optimized for dashboard pages
 */
export function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" />

      <motion.div
        className="absolute top-0 -left-40 w-80 h-80 bg-cyan-500/15 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
}

/**
 * Auth Page Background Animation
 * Optimized for authentication pages
 */
export function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900/30 to-indigo-900/20"
        animate={{
          backgroundPosition: ['0% 0%', '50% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />

      {/* Center Orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Corner Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-blue-500/15 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}

/**
 * Public Page Background Animation
 * For public/landing pages
 */
export function PublicPageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900/5 to-slate-950" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          y: [0, 60, 0],
          x: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl"
        animate={{
          y: [0, -50, 0],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
}
