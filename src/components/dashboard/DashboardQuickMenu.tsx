// src/components/dashboard/DashboardQuickMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
};

export default function DashboardQuickMenu({
  onAction,
  actions,
}: {
  onAction: (id: string) => void;
  actions: Action[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAction = (id: string) => {
    if (!isOpen) return;
    onAction(id);
    setIsOpen(false);
    setDragY(0);
  };

  // 🔽 Tirer vers le bas pour fermer (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0) setDragY(Math.min(diff, 200));
  };

  const handleTouchEnd = () => {
    if (currentY.current - startY.current > 80) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  return (
    <div className="fixed z-50 bottom-6 right-4 md:bottom-20 md:right-6" role="region" aria-label="Menu d'actions rapides">
      {/* Bouton central */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); setDragY(0); }}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 shadow-indigo-500/30'
            : 'bg-gradient-to-r from-cyan-600 to-blue-500 shadow-cyan-500/30'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {isOpen ? <X className="text-white w-5 h-5" /> : <Menu className="text-white w-5 h-5" />}
      </motion.button>

      {/* Menu radial — Desktop */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <div className="absolute bottom-20 right-0">
            <div className="relative w-64 h-64">
              {actions.map((action, i) => {
                const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 110;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, x, y }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    onClick={() => handleAction(action.id)}
                    disabled={action.disabled}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      background: `linear-gradient(135deg, ${getGradient(action.color)})`,
                      opacity: action.disabled ? 0.4 : 1,
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all"
                    title={action.label}
                  >
                    <span className="text-white scale-90">{action.icon}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom sheet — Mobile avec tirer vers le bas */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: dragY }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="w-full max-h-[75vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-t-[28px] border-t border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Poignée */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Grille */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={action.disabled}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                        action.disabled ? 'opacity-40' : 'bg-white/5 hover:bg-white/10 active:bg-white/15'
                      }`}
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5"
                        style={{ background: `linear-gradient(135deg, ${getGradient(action.color)})` }}
                      >
                        <span className="text-white scale-90">{action.icon}</span>
                      </span>
                      <span className="text-[11px] text-gray-300 font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fermer */}
              <div className="p-4 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-xl text-gray-400 border border-white/10 hover:bg-white/10 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="mr-2 w-4 h-4" /> Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getGradient = (cls: string): string => {
  const map: Record<string, string> = {
    'from-cyan-500 to-blue-500': '#06b6d4, #3b82f6',
    'from-purple-500 to-indigo-500': '#a855f7, #6366f1',
    'from-emerald-500 to-teal-500': '#10b981, #14b8a6',
    'from-amber-500 to-orange-500': '#f59e0b, #f97316',
    'from-blue-900 to-blue-800': '#1e3a5f, #1e3a8a',
    'from-sky-500 to-cyan-500': '#0ea5e9, #06b6d4',
    'from-yellow-500 to-amber-500': '#eab308, #f59e0b',
    'from-slate-500 to-gray-500': '#64748b, #6b7280',
    'from-red-500 to-rose-500': '#ef4444, #f43f5e',
  };
  return map[cls] || '#06b6d4, #3b82f6';
};