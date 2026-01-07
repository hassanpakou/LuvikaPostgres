'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function RealtimeCounter({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayed = useRef(0);

  // 🔊 Charge le son une fois
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/scan-success.mp3'); // ✅ à placer dans /public/sounds/
      audioRef.current.volume = 0.4;
    }
  }, []);

  // 🔁 Joue le son + animation à chaque incrément
  useEffect(() => {
    if (count > initialCount && audioRef.current) {
      const now = Date.now();
      if (now - lastPlayed.current > 800) { // évite les doublons rapprochés
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        lastPlayed.current = now;
      }
    }
  }, [count, initialCount]);

  return (
    <motion.div
      className="flex items-center gap-3 glass-border bg-white/5 backdrop-blur-xl rounded-xl px-5 py-3 border border-cyan-400/20"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* 🔹 Icône animée */}
      <motion.div
        animate={{ rotate: count > initialCount ? [0, 360] : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
      >
        <Users className="w-6 h-6 text-cyan-400" />
        {count > initialCount && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      {/* 🔹 Compteur */}
      <motion.div className="text-right">
        <motion.span
          key={count} // déclenche l’animation à chaque changement
          className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent"
          initial={{ scale: 1, y: 0 }}
          animate={{ scale: [1, 1.3, 1], y: [0, -8, 0] }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {count}
        </motion.span>
        <p className="text-xs text-gray-400 mt-0.5">présents</p>
      </motion.div>
    </motion.div>
  );
}