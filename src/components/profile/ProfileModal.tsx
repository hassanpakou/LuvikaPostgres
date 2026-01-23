// src/components/profile/ProfileModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // 🔹 Nouvelle prop pour les compétences
  skills?: string[];
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  skills 
}: ProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 sm:inset-6 md:inset-10 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                {children}

                {/* 🔹 Section Compétences (Skills) */}
                {skills && skills.length > 0 && title === "Compétences" && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="text-purple-400 w-5 h-5" />
                      <h3 className="text-lg font-semibold text-white">Compétences</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 py-2">
                      {skills.map((skill, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}