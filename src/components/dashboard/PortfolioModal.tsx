// src/components/dashboard/PortfolioModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { X, Plus, Trash2, Save } from 'lucide-react';

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
};

export default function PortfolioModal({
  isOpen,
  onClose,
  profileId,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Charger les projets au montage
useEffect(() => {
  if (isOpen) {
    fetch(`/api/portfolio?profile_id=${profileId}`)
      .then(res => res.json())
      .then(({ portfolios }) => {
        setItems(portfolios || []);
        setLoading(false);
      });
  }
}, [isOpen, profileId]);

  const addItem = () => {
    const newItem: PortfolioItem = {
      id: `temp-${Date.now()}`,
      title: '',
      tags: [],
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof PortfolioItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

const savePortfolio = async () => {
  setSaving(true);
  try {
    // 🔹 Parcourt chaque item et POST un par un
    for (const item of items) {
      const payload = {
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        demo_url: item.demo_url,
        repo_url: item.repo_url,
        tags: item.tags,
        position: items.indexOf(item),
      };

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'portfolio',
          data: payload, // ✅ objet simple, pas tableau
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Échec');
      }
    }
    onClose();
  } catch (err) {
  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert('❌ Une erreur inconnue est survenue');
  }
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
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-3xl p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
  {/* ✅ className sur le span, pas sur Folder */}
  <span className="text-cyan-400">
    <Folder size={20} />
  </span>
  Portfolio
</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id} className="glass-border bg-white/5">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Titre *</label>
                        <Input
                          value={item.title}
                          onChange={e => updateItem(item.id, 'title', e.target.value)}
                          placeholder="Nom du projet"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">URL démo</label>
                        <Input
                          value={item.demo_url || ''}
                          onChange={e => updateItem(item.id, 'demo_url', e.target.value)}
                          placeholder="https://"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Description</label>
                        <Textarea
                          value={item.description || ''}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Décrivez le projet..."
                          className="bg-white/10 border-white/20 text-white"
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Tags (séparés par ,)</label>
                        <Input
                          value={item.tags.join(', ')}
                          onChange={e => updateItem(item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                          placeholder="React, Firebase, Design"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-3 text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={addItem}
              >
                <Plus size={14} />
                Ajouter un projet
              </Button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-500"
              onClick={savePortfolio}
              disabled={saving || items.some(i => !i.title.trim())}
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

// 🔹 Icônes manquantes
const Folder = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);