'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, QrCode, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (eventId: string) => void;
};

export default function EventFormModal({ isOpen, onClose, onEventCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startsAt || !endsAt) {
      setError('Titre et dates sont obligatoires');
      return;
    }

    // 🔹 Vérifie que la date de fin est après le début
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError('La date de fin doit être après le début');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location, starts_at: startsAt, ends_at: endsAt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec');

      setSuccess(true);
      onEventCreated?.(data.id);

      // 🔹 Ferme après 2s
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <Card className="glass-border border-white/15 bg-black/30 backdrop-blur-xl">
              <div className="flex justify-between items-center p-5 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-amber-400" />
                  Créer un événement
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Événement créé avec succès ! 🎉
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Titre *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Conférence Tech, Mariage, etc."
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brève description..."
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">Lieu</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Kinshasa, en ligne, etc."
                      className="pl-10 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startsAt" className="text-gray-300">Début *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="startsAt"
                        type="datetime-local"
                        value={startsAt}
                        onChange={e => setStartsAt(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endsAt" className="text-gray-300">Fin *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="endsAt"
                        type="datetime-local"
                        value={endsAt}
                        onChange={e => setEndsAt(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création…
                    </span>
                  ) : success ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Créé !
                    </span>
                  ) : (
                    'Créer l’événement'
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}