// src/components/dashboard/DashboardQuickMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Bell, QrCode, Contact, AlertTriangle,
  MessageSquare, User, Search, Package, Calendar, ArrowUp, Plus, Users,
  Menu, X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
};

// 🔹 Hook pour jouer un son (optimisé)
const useSound = (soundPath: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Précharger le son avec gestion d'erreur
    const audio = new Audio(soundPath);
    audio.volume = 0.25; // Volume discret
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [soundPath]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        // Silencieux en production - pas d'erreur dans la console
        if (process.env.NODE_ENV === 'development') {
          console.warn('Audio play failed:', err);
        }
      });
    }
  };

  return play;
};

// 🔹 Composant — version optimisée et responsive
export default function DashboardQuickMenu({
  onAction,
  actions,
}: {
  onAction: (id: string) => void;
  actions: Action[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  
useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []); // plus de dépendances


  // 🔹 Gestion du drag optimisée
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    document.body.style.overflow = 'hidden'; // Empêcher le scroll pendant le drag
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - startYRef.current;
    if (deltaY > 0) {
      setDragOffset(Math.min(deltaY, window.innerHeight * 0.6));
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    document.body.style.overflow = '';
    setIsDragging(false);
    
    if (dragOffset > window.innerHeight * 0.2) {
      setIsOpen(false);
    }
    setDragOffset(0);
  };

  // 🔹 Gestion des événements de drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) handleMove(e.touches[0].clientY);
    };
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = '';
    };
  }, [isDragging]);

  // 🔹 Fermer avec la touche Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // 🔹 Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  return (
    <div 
      className={`fixed z-50 ${
        isMobile 
          ? 'bottom-6 right-4'        // Mobile: plus bas et centré
          : 'bottom-20 right-6'       // Desktop: position originale
      }`}
      role="region"
      aria-label="Menu d'actions rapides"
    >
      {/* 🔹 Bouton central (+) - Amélioré */}
      <motion.button
        initial={{ scale: 1 }}
        animate={{ scale: isOpen ? 1.05 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2
          transition-all duration-300
          ${
            isOpen 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 border-indigo-400 shadow-indigo-500/40' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-500 border-cyan-400 shadow-cyan-500/30 hover:shadow-cyan-500/50'
          }
        `}
        aria-expanded={isOpen}
        aria-controls="quick-menu-actions"
        aria-label={isOpen ? "Fermer le menu d'actions" : "Ouvrir le menu d'actions rapides"}
      >
        {isOpen ? (
          <X className="text-white" size={24} strokeWidth={2.5} />
        ) : (
          <Menu className="text-white" size={24} strokeWidth={2.5} />
        )}
      </motion.button>

      {/* 🔹 Menu radial - Desktop uniquement */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <div 
            id="quick-menu-actions"
            className="absolute bottom-20 right-0"
            role="menu"
          >
            <div className="relative w-72 h-72">
              {actions.map((action, i) => {
                const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={action.id}
                    role="menuitem"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1, 
                      x, 
                      y 
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
  delay: i * 0.01,
  duration: 0.12,
  ease: 'easeOut',
}}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      background: `linear-gradient(135deg, ${getGradient(action.color)})`,
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.4 : 1,
                    }}
                    onClick={() => {
                      if (!action.disabled) {
                        onAction(action.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={action.disabled}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border border-white/20 shadow-lg
                      transition-all duration-200
                      hover:scale-110 active:scale-95
                      ${action.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title={action.label}
                    aria-label={action.label}
                  >
                    <span className="text-white">{action.icon}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔹 Version mobile : popup linéaire améliorée */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
            onClick={() => {
              setIsOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ 
                y: isDragging ? dragOffset : 0,
                opacity: 1,
                transition: isDragging
                  ? { type: 'tween' }
                  : { type: 'spring', damping: 26, stiffness: 280 },
              }}
              exit={{ y: '100%', opacity: 0 }}
              className={`
                w-full max-h-[85vh] overflow-y-auto
                bg-gradient-to-b from-gray-900/95 to-black/95 
                backdrop-blur-xl rounded-t-3xl 
                border-t border-white/10
                shadow-2xl shadow-black/50
              `}
              onClick={e => e.stopPropagation()}
              onMouseDown={(e) => handleStart(e.clientY)}
              onTouchStart={(e) => handleStart(e.touches[0].clientY)}
              role="menu"
            >
              {/* 🔹 Handle de drag amélioré */}
              <div 
                className="flex justify-center pt-4 pb-2 touch-none cursor-grab active:cursor-grabbing"
                aria-hidden="true"
              >
                <div className="w-16 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* 🔹 Titre avec icône */}
              <div className="px-6 pb-4 border-b border-white/10">
                <h3 
                  id="mobile-menu-title" 
                  className="text-xl font-bold text-white flex items-center justify-center gap-2"
                >
                  <Menu className="w-5 h-5 text-cyan-400" />
                  Actions rapides
                </h3>
              </div>

              {/* 🔹 Grille responsive */}
              <div className="p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {actions.map(action => (
                    <motion.button
                      key={action.id}
                      role="menuitem"
                      whileHover={{ scale: action.disabled ? 1 : 1.05 }}
                      whileTap={{ scale: action.disabled ? 1 : 0.95 }}
                      onClick={() => {
                        if (!action.disabled) {
                          onAction(action.id);
                          setIsOpen(false);
                        }
                      }}
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
                      aria-label={action.label}
                    >
                      <span
                        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 ${
                          action.disabled ? 'opacity-50' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${getGradient(action.color)})`,
                          boxShadow: `0 4px 12px rgba(${action.color.split(' ')[0].replace('from-', '').replace('-', ',')}, 0.3)`
                        }}
                      >
                        <span className="text-white">{action.icon}</span>
                      </span>
                      <span className="text-[11px] text-gray-200 text-center font-medium leading-tight max-w-full truncate">
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 🔹 Bouton de fermeture amélioré */}
              <div className="p-4 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`
                    w-full h-12 rounded-xl text-gray-300 
                    border border-white/15 hover:bg-white/10 
                    active:bg-white/20 transition-all
                  `}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  aria-label="Fermer le menu"
                >
                  <X className="mr-2 h-4 w-4" />
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

// 🔹 Helper pour les gradients (optimisé)
const getGradient = (cls: string): string => {
  const gradients: Record<string, string> = {
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
  return gradients[cls] || '#3b82f6, #60a5fa'; // Default: blue
};
