'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const animateProgress = (now: number) => {
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(Math.floor(newProgress));
      if (elapsed < duration) {
        requestAnimationFrame(animateProgress);
      } else {
        setTimeout(() => setIsVisible(false), 200);
      }
    };

    const frame = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
        >
          {/* Logo avec animation */}
          <motion.div
            className="relative w-32 h-32 mb-4"
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 0,
              transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.1 },
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <Image
              src="/logo-luvika.png"
              alt="LUVIKA"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Texte LUVIKA avec animation */}
          <motion.h1
            className="text-3xl font-bold text-blue-900 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            LUVIKA
          </motion.h1>

          {/* Barre de progression */}
          <div className="w-64 max-w-[80%] text-center">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="mt-3 text-gray-500 font-medium text-sm">
              Chargement {progress}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}