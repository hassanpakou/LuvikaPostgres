// src/components/dashboard/ContactRequestsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Clock, CheckCircle, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function ContactRequestsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/contact-requests');
        const { requests } = await res.json();
        setRequests(requests);
      } catch (err) {
        console.error('❌ Failed to load contact requests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/contact-requests/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      setRequests(prev => 
        prev.map(req => req.id === id ? { ...req, is_read: true } : req)
      );
    } catch (err) {
      console.error('❌ Failed to mark as read', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-2xl border border-white/20 overflow-hidden mx-2 sm:mx-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Mail className="text-cyan-400" size={18} />
              Messages reçus
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white -mr-2"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto p-3 sm:p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Mail className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>Aucun message pour le moment</p>
                <p className="text-sm mt-1">Les demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`glass-border bg-white/5 p-3 sm:p-4 rounded-xl border ${
                      req.is_read ? 'border-white/10' : 'border-cyan-400/30 bg-cyan-400/5'
                    }`}
                  >
                    {/* En-tête : Avatar + infos */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      {/* Partie gauche : avatar + nom/email/téléphone */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-white truncate">{req.name}</h3>
                            {!req.is_read && (
                              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-xs whitespace-nowrap">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          {/* Email + téléphone avec wrap sécurisé */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-gray-400">
                            <span className="flex items-center gap-1 min-w-0">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="break-all">{req.email}</span>
                            </span>
                            {req.phone && (
                              <span className="flex items-center gap-1 min-w-0">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span className="break-all">{req.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Partie droite : date + bouton "Lu" - empilée verticalement sur mobile */}
                      <div className="flex flex-row sm:flex-col items-center justify-start sm:items-end gap-3 sm:gap-1 mt-2 sm:mt-0">
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                        </div>
                        {!req.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                            onClick={() => markAsRead(req.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Lu
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-line break-words">
                        {req.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-white/10 text-center text-[10px] sm:text-xs text-gray-500">
            ✅ Les messages sont stockés temporairement dans votre compte<br />
            🔒 Conformément au RGPD, ils ne sont ni vendus ni partagés
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}