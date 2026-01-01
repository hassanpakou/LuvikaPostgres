// src/components/dashboard/CreateEventModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, QrCode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EventData = {
  id: string;
  name: string;
  qr_code_id: string;
  starts_at: string;
  ends_at: string;
};

export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventData) => void;
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<EventData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, description, starts_at: startsAt, ends_at: endsAt }),
      });

      if (!res.ok) throw new Error('Échec création');
      const { event } = await res.json();
      setSuccess(event);
      onEventCreated(event);
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-amber-400" size={20} />
              Créer un événement
            </h2>
            <Button variant="ghost" size="sm" className="text-gray-400" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <div className="p-5">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{success.name}</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Événement créé avec succès ✅<br />
                  Partagez ce QR pour l’enregistrement des présences.
                </p>

                {/* 🔹 QR Code */}
                <div className="bg-white p-3 rounded-xl inline-block mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(`https://luvika.me/e/${success.qr_code_id}`)}`}
                    alt="QR Événement"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  URL : <code className="text-cyan-400">luvika.me/e/{success.qr_code_id}</code>
                </p>

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://luvika.me/e/${success.qr_code_id}`);
                      alert('Lien copié !');
                    }}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    📋 Copier le lien
                  </Button>
                  <Button
                    onClick={onClose}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Nom *
                  </label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    placeholder="Conférence Tech"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Lieu
                  </label>
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    placeholder="Kinshasa, RDC"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Description</label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
                    placeholder="Présentation de LUVIKA..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Début *
                    </label>
                    <Input
                      type="datetime-local"
                      value={startsAt}
                      onChange={e => setStartsAt(e.target.value)}
                      required
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Fin *
                    </label>
                    <Input
                      type="datetime-local"
                      value={endsAt}
                      onChange={e => setEndsAt(e.target.value)}
                      required
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-500 py-3"
                >
                  {isSubmitting ? 'Création...' : '✅ Créer l’événement'}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}