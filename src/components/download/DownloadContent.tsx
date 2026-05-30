// src/components/download/DownloadContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, QrCode, Scan } from 'lucide-react';
import NFCIcon from '../../components/icons/NFCIcon';
import ProfileCard3D from '../../../components/cards/ProfileCard3D';

export default function DownloadContent({
  title,
  subtitle,
  step1_title,
  step1_desc,
  step2_title,
  step2_desc,
  step3_title,
  step3_desc,
  cta_title,
  cta_desc,
  download_now,
}: {
  title: string;
  subtitle: string;
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  cta_title: string;
  cta_desc: string;
  download_now: string;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            Chargement...
          </span>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { icon: <NFCIcon size={24} />, title: step1_title, desc: step1_desc },
    { icon: <QrCode className="w-6 h-6 text-cyan-300/70" />, title: step2_title, desc: step2_desc },
    { icon: <Scan className="w-6 h-6 text-blue-300/70" />, title: step3_title, desc: step3_desc },
  ];

  return (
    <AnimatePresence>
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: 'easeOut' }}
            className="text-sm text-gray-300/70 max-w-xl mx-auto mb-10 font-light leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Card 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="mb-12"
          >
            <ProfileCard3D />
          </motion.div>

          {/* Étapes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 mx-auto border border-cyan-500/10">
                  <div className="text-cyan-300/70">{step.icon}</div>
                </div>
                <h3 className="text-base font-semibold text-white/80 mb-1.5">{step.title}</h3>
                <p className="text-gray-300/60 text-xs font-light leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="rounded-2xl p-6 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] max-w-lg mx-auto">
              <h2 className="text-xl font-semibold text-white/80 mb-2">{cta_title}</h2>
              <p className="text-gray-300/60 text-sm font-light mb-5">{cta_desc}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-400 rounded-full text-white text-sm font-light flex items-center gap-2 mx-auto shadow-lg shadow-cyan-500/10 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                {download_now}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}