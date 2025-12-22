// src/components/about/AboutContent.tsx ✅ CORRIGÉ FINAL
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutContent({
  title,
  subtitle,
  mission_title,
  mission_content,
  security,
  security_desc,
  accessibility,
  accessibility_desc,
  african_pride,
  african_pride_desc,
  team_title,
  team_content,
  team_cta,
}: {
  title: string;
  subtitle: string;
  mission_title: string;
  mission_content: string;
  security: string;
  security_desc: string;
  accessibility: string;
  accessibility_desc: string;
  african_pride: string;
  african_pride_desc: string;
  team_title: string;
  team_content: string;
  team_cta: string;
}) {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
        >
          {title} {/* ✅ string, pas t('...') */}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 text-center max-w-2xl mx-auto mb-16"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-border rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">{mission_title}</h2>
          <p className="text-gray-300 leading-relaxed">{mission_content}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { title: security, desc: security_desc },
            { title: accessibility, desc: accessibility_desc },
            { title: african_pride, desc: african_pride_desc },
          ].map((item, i) => (
            <div key={i} className="glass-border rounded-2xl p-6 hover-glass">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-cyan-400/30" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">{team_title}</h2>
          <div className="flex justify-center">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 border-2 border-white flex items-center justify-center text-white font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-gray-300 max-w-2xl mx-auto">{team_content}</p>
          <div className="mt-8">
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.03 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-medium text-white shadow-lg shadow-blue-500/20"
              >
                {team_cta}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}