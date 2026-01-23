// src/components/download/DownloadContent.tsx
'use client';

import { motion } from 'framer-motion';
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
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 max-w-2xl mx-auto mb-12"
        >
          {subtitle}
        </motion.p>

        {/* Card 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          className="mb-16"
        >
          <ProfileCard3D />
        </motion.div>

        {/* Étapes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            { icon: <NFCIcon size={32} />, title: step1_title, desc: step1_desc },
            { icon: <QrCode className="w-8 h-8 text-cyan-300" />, title: step2_title, desc: step2_desc },
            { icon: <Scan className="w-8 h-8 text-blue-300" />, title: step3_title, desc: step3_desc },
          ].map((step, i) => (
            <div key={i} className="glass-border rounded-2xl p-6">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 mx-auto">
                <div className="text-cyan-300">{step.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">{cta_title}</h2>
            <p className="text-gray-300 mb-6">{cta_desc}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-bold text-white text-lg flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              {download_now}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}