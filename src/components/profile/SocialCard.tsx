// src/components/profile/SocialCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

interface SocialCardProps {
  platform: 'instagram' | 'linkedin' | 'github' | 'gitlab' | 'tiktok' | 'snapchat' | 'telegram' | 'behance' | 'dribbble';
  label: string;
  handle: string;
  href: string;
  icon: React.ReactNode;
  gradient?: string;
}

export default function SocialCard({
  platform,
  label,
  handle,
  href,
  icon,
  gradient = 'from-gray-500 to-gray-400'
}: SocialCardProps) {
  // Mapping des styles par plateforme
  const platformStyles = {
    instagram: {
      bg: 'from-pink-500 to-rose-500',
      border: 'border-pink-500/20',
      hover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      text: 'text-pink-400'
    },
    linkedin: {
      bg: 'from-blue-600 to-cyan-500',
      border: 'border-blue-500/20',
      hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
      text: 'text-blue-400'
    },
    github: {
      bg: 'from-gray-700 to-gray-500',
      border: 'border-gray-500/20',
      hover: 'hover:border-gray-500/40 hover:shadow-gray-500/10',
      text: 'text-gray-400'
    },
    gitlab: {
      bg: 'from-orange-500 to-amber-500',
      border: 'border-orange-500/20',
      hover: 'hover:border-orange-500/40 hover:shadow-orange-500/10',
      text: 'text-orange-400'
    },
    tiktok: {
      bg: 'from-black to-gray-800',
      border: 'border-gray-700/20',
      hover: 'hover:border-gray-700/40 hover:shadow-gray-700/10',
      text: 'text-white'
    },
    snapchat: {
      bg: 'from-yellow-400 to-amber-400',
      border: 'border-yellow-400/20',
      hover: 'hover:border-yellow-400/40 hover:shadow-yellow-400/10',
      text: 'text-yellow-400'
    },
    telegram: {
      bg: 'from-blue-400 to-cyan-400',
      border: 'border-blue-400/20',
      hover: 'hover:border-blue-400/40 hover:shadow-blue-400/10',
      text: 'text-blue-400'
    },
    behance: {
      bg: 'from-blue-500 to-cyan-500',
      border: 'border-blue-500/20',
      hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
      text: 'text-blue-400'
    },
    dribbble: {
      bg: 'from-pink-500 to-rose-500',
      border: 'border-pink-500/20',
      hover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      text: 'text-pink-400'
    },
  };

  const styles = platformStyles[platform] || platformStyles.github;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block bg-gradient-to-br from-${styles.bg.split(' ')[0].replace('from-', '')}/30 to-${styles.bg.split(' ')[1].replace('to-', '')}/20 ${styles.border} rounded-2xl p-5 cursor-pointer transition-all duration-300 ${styles.hover}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <ExternalLink className={`w-4 h-4 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
          {label}
          <ArrowUpRight className={`w-3 h-3 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </h3>
        <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-1">
          {handle}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/70`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/50`}></div>
        </div>
      </a>
    </motion.div>
  );
}