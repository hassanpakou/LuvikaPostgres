// src/components/profile/ActionItem.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../../../components/ui/tooltip';

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string; // ✅ On ajoute className ici
}

export default function ActionItem({
  icon,
  label,
  href,
  onClick,
  className,
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

  const baseClasses =
    'flex flex-col items-center p-2 gap-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10';

  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return isMobile ? (
    <Tooltip content={label} side="top" delayDuration={200}>
      <motion.button
        whileHover={{ y: -2, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={combinedClasses}
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
      className={combinedClasses}
    >
      <span className="text-gray-300 hover:text-white">{icon}</span>
      <span className="text-[11px] text-gray-400 whitespace-nowrap">{label}</span>
    </motion.button>
  );
}
