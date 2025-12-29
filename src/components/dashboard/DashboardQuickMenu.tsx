// src/components/dashboard/DashboardQuickMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Bell, QrCode, Contact, AlertTriangle,
  MessageSquare, Package, ArrowUp, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const actions: Action[] = [
  { id: 'visibility', label: 'Visibilité', icon: <Eye size={18} />, color: 'from-purple-500 to-indigo-500' },
  { id: 'contact', label: 'Messages', icon: <Bell size={18} />, color: 'from-cyan-500 to-blue-500' },
  { id: 'qr', label: 'QR Code', icon: <QrCode size={18} />, color: 'from-emerald-500 to-teal-500' },
  { id: 'nfc', label: 'Cartes NFC', icon: <Contact size={18} />, color: 'from-amber-500 to-orange-500' },
  { id: 'report', label: 'Signaler', icon: <AlertTriangle size={18} />, color: 'from-red-500 to-rose-500' },
  { id: 'message', label: 'Message perso', icon: <MessageSquare size={18} />, color: 'from-indigo-500 to-violet-500' },
  { id: 'orders', label: 'Commandes', icon: <Package size={18} />, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'upgrade', label: 'Upgrade', icon: <ArrowUp size={18} />, color: 'from-cyan-400 to-blue-400' },
];

export default function DashboardQuickMenu({
  onAction,
}: {
  onAction: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton central (+) */}
      <motion.button
        initial={{ scale: 1 }}
        animate={{ scale: isOpen ? 1.1 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500 flex items-center justify-center shadow-xl border border-white/20 shadow-cyan-500/30"
        aria-label="Actions rapides"
      >
        <Plus className="text-white" size={24} />
      </motion.button>

      {/* Menu radial */}
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
  animate={{ 
    scale: 1, 
    opacity: 1, 
    x, 
    y 
  }}
  exit={{ scale: 0, opacity: 0 }}
  transition={{
    delay: i * 0.04,
    type: 'spring',
    stiffness: 300,
    damping: 15,
  }}
  style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    background: `linear-gradient(135deg, ${getGradient(action.color)})`,
  }}
  onClick={() => {
    onAction(action.id);
    setIsOpen(false);
  }}
  className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 transition-all"
  title={action.label}
>
                    <span className="text-white">{action.icon}</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Version mobile : popup linéaire */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-end p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-gradient-to-b from-gray-900/90 to-black/95 backdrop-blur-xl rounded-t-3xl p-6 border-t border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-6">Actions rapides</h3>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {actions.map(action => (
                  <motion.button
                    key={action.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onAction(action.id);
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    title={action.label}
                  >
                    <span className={`w-10 h-10 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-2`}>
                      <span className="text-white">{action.icon}</span>
                    </span>
                    <span className="text-xs text-gray-300">{action.label}</span>
                  </motion.button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                Fermer
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getGradient = (cls: string) => {
  const map: Record<string, string> = {
    'from-purple-500 to-indigo-500': '#a855f7, #818cf8',
    'from-cyan-500 to-blue-500': '#06b6d4, #3b82f6',
    'from-emerald-500 to-teal-500': '#10b981, #0d9488',
    'from-amber-500 to-orange-500': '#f59e0b, #f97316',
    'from-red-500 to-rose-500': '#ef4444, #ec4899',
    'from-indigo-500 to-violet-500': '#6366f1, #8b5cf6',
    'from-fuchsia-500 to-pink-500': '#d946ef, #ec4899',
    'from-cyan-400 to-blue-400': '#22d3ee, #60a5fa',
  };
  return map[cls] || '#6b7280, #4b5563';
};