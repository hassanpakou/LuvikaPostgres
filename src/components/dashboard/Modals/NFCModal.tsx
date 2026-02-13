// src/components/dashboard/modals/NFCModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { NFCCard } from '@/src/types/nfc';

export default function NFCModal({
  isOpen,
  onClose,
  cards,
  onManageCard,
}: {
  isOpen: boolean;
  onClose: () => void;
  cards: NFCCard[];
  onManageCard?: (card: NFCCard) => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 w-6 h-6 rounded-full flex items-center justify-center">
                <span className="text-black text-xs">N</span>
              </span>
              Mes cartes NFC
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-400" size={28} />
              </div>
              <p className="text-gray-400">Aucune carte NFC associée.</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {cards.map(card => (
                <Card 
                  key={card.id} 
                  className="glass-border bg-white/5 border-white/10 p-4 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer"
                  onClick={() => onManageCard?.(card)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm text-blue-300">{card.card_id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge className={
                      card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      card.status === 'lost' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      card.status === 'blocked' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }>
                      {card.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
