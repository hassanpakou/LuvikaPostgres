// src/components/dashboard/DashboardQuickMenu.tsx
'use client';

import { useState, useEffect } from 'react';
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
  };

  return (
    <div
      className={`fixed z-50 ${
        isMobile ? 'bottom-6 right-4' : 'bottom-20 right-6'
      }`}
      role="region"
      aria-label="Menu d'actions rapides"
    >
      {/* Bouton central */}
      <motion.button
        initial={{ scale: 1 }}
        animate={{ scale: isOpen ? 1.05 : 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2
          transition-all duration-300
          ${
            isOpen
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 border-indigo-400 shadow-indigo-500/40'
              : 'bg-gradient-to-r from-cyan-600 to-blue-500 border-cyan-400 shadow-cyan-500/30'
          }
        `}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {isOpen ? (
          <X className="text-white w-6 h-6" strokeWidth={2.5} />
        ) : (
          <Menu className="text-white w-6 h-6" strokeWidth={2.5} />
        )}
      </motion.button>

      {/* Menu radial - Desktop */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <div className="absolute bottom-20 right-0">
            <div className="relative w-72 h-72">
              {actions.map((action, i) => {
                const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 120;
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
                      opacity: action.disabled ? 0.5 : 1,
                    }}
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center
                      border border-white/20 shadow-lg
                      hover:scale-110 active:scale-95 transition-all
                      ${action.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title={action.label}
                  >
                    <span className="text-white">{action.icon}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Menu mobile : bottom sheet */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-h-[80vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poignée de tirage */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-16 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Titre */}
              <div className="px-6 pb-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Menu className="w-5 h-5 text-cyan-400" />
                  Actions rapides
                </h3>
              </div>

              {/* Grille d'actions */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={action.disabled}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl transition-all
                        ${
                          action.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/15 active:bg-white/20'
                        }
                      `}
                      title={action.label}
                    >
                      <span
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5"
                        style={{
                          background: `linear-gradient(135deg, ${getGradient(action.color)})`,
                        }}
                      >
                        <span className="text-white">{action.icon}</span>
                      </span>
                      <span className="text-xs text-gray-200 text-center font-medium">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton fermer */}
              <div className="p-4 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-xl text-gray-300 border border-white/15 hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="mr-2 w-4 h-4" />
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper pour convertir les classes Tailwind en valeurs de dégradé (simplifié)
const getGradient = (cls: string): string => {
  const map: Record<string, string> = {
    'from-purple-500 to-indigo-500': '#a855f7, #818cf8',
    'from-cyan-500 to-blue-500': '#06b6d4, #3b82f6',
    'from-emerald-500 to-teal-500': '#10b981, #0d9488',
    'from-amber-500 to-orange-500': '#f59e0b, #f97316',
    'from-red-500 to-rose-500': '#ef4444, #ec4899',
    'from-indigo-500 to-violet-500': '#6366f1, #8b5cf6',
    'from-fuchsia-500 to-pink-500': '#d946ef, #ec4899',
    'from-cyan-400 to-blue-400': '#22d3ee, #60a5fa',
    'from-green-400 to-emerald-500': '#22c55e, #10b981',
    'from-gray-500 to-gray-600': '#6b7280, #4b5563',
  };
  return map[cls] || '#06b6d4, #3b82f6';
};