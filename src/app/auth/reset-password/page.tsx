// src/app/auth/reset-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// 🔹 Effet bulles flottantes
const FloatingBubbles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
        style={{
          width: `${12 + i * 6}px`,
          height: `${12 + i * 6}px`,
          left: `${10 + i * 18}%`,
          bottom: '-20px',
        }}
        animate={{
          y: [-20, -140],
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 6 + i,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeOut"
        }}
      />
    ))}
  </div>
);

export default function ResetPasswordRedirect() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ⏳ Attend que les params soient prêts
    if (searchParams) {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next');

      // Redirige vers /auth/update-password avec les mêmes params
      const url = new URL('/auth/update-password', window.location.origin);
      if (tokenHash) url.searchParams.set('token_hash', tokenHash);
      if (type) url.searchParams.set('type', type);
      if (next) url.searchParams.set('next', next);

      window.location.href = url.toString();
      setIsReady(true);
    }
  }, [searchParams]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 🔹 Fond dynamique */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)]" />
        <FloatingBubbles />

        <Link 
          href="/auth/sign-in" 
          className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('auth.reset_password.back_to_login')}</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative"
        >
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
            {/* 🔹 Glow interne */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 blur opacity-30" />

            <div className="relative p-7 md:p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/10"
              >
                <RefreshCw className="w-7 h-7 text-cyan-300" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {t('auth.reset_password.title')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('auth.reset_password.subtitle')}
              </p>

              <div className="mt-8 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
              </div>

              <p className="text-center text-gray-400 text-sm mt-4">
                {t('auth.reset_password.redirecting')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
