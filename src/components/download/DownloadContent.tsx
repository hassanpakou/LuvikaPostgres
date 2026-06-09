// src/components/download/DownloadContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, QrCode, Scan, Nfc, Smartphone, 
  CreditCard, Share2, Zap, ArrowRight, CheckCircle2 
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ProfileCard3D = dynamic(
  () => import('@/components/cards/ProfileCard3D'),
  {
    loading: () => (
      <div className="w-full aspect-[16/9] max-w-[480px] mx-auto rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    ),
    ssr: false
  }
);

type Step = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: string;
};

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
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Démo automatique du scan
  useEffect(() => {
    if (loading) return;
    const demoInterval = setInterval(() => {
      setShowDemo(true);
      setTimeout(() => setShowDemo(false), 2000);
    }, 6000);
    return () => clearInterval(demoInterval);
  }, [loading]);

  const steps: Step[] = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: step1_title,
      desc: step1_desc,
      highlight: 'NFC',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: step2_title,
      desc: step2_desc,
      highlight: 'QR',
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: step3_title,
      desc: step3_desc,
      highlight: 'Instant',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            Préparation de votre expérience...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent py-8 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs text-cyan-300/80 font-medium tracking-wide">
              Technologie NFC + QR
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
            {title}
          </h1>

          <p className="text-base md:text-lg text-gray-300/80 max-w-2xl mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Carte interactive avec démo scan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-16"
        >
          {/* Indicateur de scan */}
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Nfc className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span className="text-xs text-cyan-300 font-medium">
                  Approchez votre téléphone
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ondes de scan simulées */}
          <AnimatePresence>
            {showDemo && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-3xl border border-cyan-400/40"
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 0, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <ProfileCard3D
            onTap={() => setShowDemo(true)}
          />

          {/* Badge "Tap to preview" */}
          <motion.p
            className="text-center mt-4 text-xs text-gray-500/60 font-light"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            👆 Appuyez sur la carte pour voir l'animation de scan
          </motion.p>
        </motion.div>

        {/* Étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4 }}
              onHoverStart={() => setActiveStep(i)}
              onHoverEnd={() => setActiveStep(null)}
              className="group relative"
            >
              <div className={`
                rounded-2xl p-6 h-full
                bg-white/[0.02] backdrop-blur-sm 
                border transition-all duration-300
                ${activeStep === i 
                  ? 'border-cyan-400/30 bg-white/[0.04] shadow-lg shadow-cyan-500/5' 
                  : 'border-white/[0.06] hover:border-white/[0.1]'
                }
              `}>
                {/* Numéro d'étape */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      transition-colors duration-300
                      ${activeStep === i 
                        ? 'bg-cyan-500/20 border-cyan-400/30' 
                        : 'bg-white/[0.03] border-white/[0.06]'
                      }
                      border
                    `}
                    animate={activeStep === i ? { scale: [1, 1.1, 1] } : {}}
                  >
                    <div className={activeStep === i ? 'text-cyan-300' : 'text-gray-400/60'}>
                      {step.icon}
                    </div>
                  </motion.div>

                  {step.highlight && (
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-medium
                      transition-colors duration-300
                      ${activeStep === i 
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/20' 
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.04]'
                      }
                    `}>
                      {step.highlight}
                    </span>
                  )}
                </div>

                <h3 className={`
                  text-lg font-semibold mb-2 transition-colors duration-300
                  ${activeStep === i ? 'text-white' : 'text-white/70'}
                `}>
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-400/70 font-light leading-relaxed">
                  {step.desc}
                </p>

                {/* Flèche de progression (sauf dernière étape) */}
                {i < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-cyan-400/30"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="rounded-3xl p-8 md:p-10 bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.03] backdrop-blur-sm border border-white/[0.06] max-w-2xl mx-auto">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Download className="w-7 h-7 text-cyan-400" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {cta_title}
            </h2>
            
            <p className="text-gray-300/70 text-sm md:text-base font-light mb-8 max-w-md mx-auto">
              {cta_desc}
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl text-white font-medium shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              <span>{download_now}</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>

            {/* Avantages */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-white/[0.04]">
              {[
                { icon: Zap, text: 'Configuration 2 min' },
                { icon: Nfc, text: 'Compatible NFC' },
                { icon: QrCode, text: 'QR Code inclus' },
                { icon: CheckCircle2, text: 'Sans engagement' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-xs text-gray-400/60"
                  whileHover={{ color: '#67e8f9' }}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}