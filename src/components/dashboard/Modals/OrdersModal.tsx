// src/components/dashboard/modals/OrdersModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // ✅ IMPORT AJOUTÉ

export default function OrdersModal({
  isOpen,
  onClose,
  isAdmin,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
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
              <Package size={20} className="text-violet-400" />
              Commandes
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <Card className="glass-border bg-white/5 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Carte NFC Premium</p>
                  <p className="text-sm text-gray-400">Livraison estimée : 5–7 jours</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-300">En attente</Badge>
              </div>
            </Card>

            <Card className="glass-border bg-white/5 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Abonnement Premium</p>
                  <p className="text-sm text-gray-400">Valable 1 an</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300">Actif</Badge>
              </div>
            </Card>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
            onClick={() => {
              window.location.href = isAdmin ? '/admin/orders' : '/dashboard/orders';
              onClose();
            }}
          >
            <span>Voir toutes les commandes</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}