// src/components/profile/ActionItem.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/src/src/components/ui/tooltip'; // ✅ Compatible

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

export default function ActionItem({
  icon,
  label,
  href,
  onClick,
}: ActionItemProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    else if (href) window.open(href, '_blank');
  };
console.log('isMobile:', isMobile, 'label:', label);
  return isMobile ? (
    <Tooltip content={label} side="top" delayDuration={200}>
      <motion.button
        whileHover={{ y: -2, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="flex flex-col items-center p-2 gap-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        aria-label={label}
      >
        <span className="text-gray-300 hover:text-white">{icon}</span>
      </motion.button>
    </Tooltip>
  ) : (
    <motion.button
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex flex-col items-center p-2 gap-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
    >
        
      <span className="text-gray-300 hover:text-white">{icon}</span>
      <span className="text-[11px] text-gray-400 whitespace-nowrap">{label}</span>
    </motion.button>
  );
}