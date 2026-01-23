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
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-2xl border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 🔹 Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="text-cyan-400" size={20} />
              Messages reçus
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>

          {/* 🔹 Body */}
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Mail className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>Aucun message pour le moment</p>
                <p className="text-sm mt-1">Les demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`glass-border bg-white/5 p-4 rounded-xl border ${
                      req.is_read ? 'border-white/10' : 'border-cyan-400/30 bg-cyan-400/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{req.name}</h3>
                            {!req.is_read && (
                              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-400">
                            <Mail className="w-3.5 h-3.5" /> {req.email}
                            {req.phone && (
                              <>
                                <span>•</span>
                                <Phone className="w-3.5 h-3.5" /> {req.phone}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                        </div>
                        {!req.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                            onClick={() => markAsRead(req.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Lu
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-gray-300 text-sm whitespace-pre-line">{req.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🔹 Footer */}
          <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
            ✅ Les messages sont stockés temporairement dans votre compte<br />
            🔒 Conformément au RGPD, ils ne sont ni vendus ni partagés
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}