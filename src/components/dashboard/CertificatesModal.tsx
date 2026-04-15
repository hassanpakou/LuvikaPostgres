// src/components/dashboard/CertificatesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Calendar, Link, Plus, Trash2, Save, X } from 'lucide-react';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date_issued: string;
  credential_id?: string;
  credential_url?: string;
};

export default function CertificatesModal({
  isOpen,
  onClose,
  profileId,
  onSuccess,  
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onSuccess?: () => void;
}) {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/portfolio?profile_id=${profileId}`)
        .then(res => res.json())
        .then(({ certificates }) => {
          setItems(certificates || []);
          setLoading(false);
        });
    }
  }, [isOpen, profileId]);

  const addItem = () => {
    const newItem: Certificate = {
      id: `temp-${Date.now()}`,
      title: '',
      issuer: '',
      date_issued: new Date().toISOString().slice(0, 10),
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof Certificate, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

const saveCertificates = async () => {
  setSaving(true);
  try {
    for (const item of items) {
      await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'certificate',
            data: { // ✅ 'data:' ajouté ici
              title: item.title,
              issuer: item.issuer,
              date_issued: item.date_issued,
              credential_id: item.credential_id,
              credential_url: item.credential_url,
            },
          }),
        });
      }
    onSuccess?.();  
    onClose();
  } catch (err) {
    alert('❌ Échec sauvegarde certifications');
  } finally {
    setSaving(false);
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-yellow-400" size={20} />
              Certifications
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id} className="glass-border bg-white/5">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-400">Titre *</label>
                        <Input
                          value={item.title}
                          onChange={e => updateItem(item.id, 'title', e.target.value)}
                          placeholder="MAKEATHON Orange"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Délivré par *</label>
                        <Input
                          value={item.issuer}
                          onChange={e => updateItem(item.id, 'issuer', e.target.value)}
                          placeholder="Orange RDC"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Date *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                          <Input
                            type="date"
                            value={item.date_issued}
                            onChange={e => updateItem(item.id, 'date_issued', e.target.value)}
                            className="pl-9 bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">ID certificat</label>
                        <Input
                          value={item.credential_id || ''}
                          onChange={e => updateItem(item.id, 'credential_id', e.target.value)}
                          placeholder="MO-2025-123"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400 flex items-center gap-1">
                          <Link size={14} /> URL vérification
                        </label>
                        <Input
                          value={item.credential_url || ''}
                          onChange={e => updateItem(item.id, 'credential_url', e.target.value)}
                          placeholder="https://verify.orange.com/..."
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-2 text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 w-full"
                onClick={addItem}
              >
                <Plus size={14} /> Ajouter une certification
              </Button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500"
              onClick={saveCertificates}
              disabled={saving || items.some(i => !i.title.trim() || !i.issuer.trim())}
            >
              {saving ? (
                <>
                  <Save className="w-4 h-4 mr-1 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🔹 Icône Award
const Award = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <circle cx="12" cy="8" r="7" />
    <path d="M8.21 13.89A4 4 0 0 0 12 14a4 4 0 0 0 3.79-.11" />
    <path d="M16.9 17a3.98 3.98 0 0 0 2.18-3.43" />
    <path d="M4.1 17a3.98 3.98 0 0 1 2.18-3.43" />
  </svg>
);