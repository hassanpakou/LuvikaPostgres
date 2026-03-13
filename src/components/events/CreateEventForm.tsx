'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Hash, Link as LinkIcon, QrCode, Send, RotateCcw,
  Locate, Clock, Tag, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

const formatDateForInput = (dateStr: string): string => new Date(dateStr).toISOString().slice(0, 16);

type EventData = {
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  is_public: boolean;
  max_participants?: number;
};

type Props = {
  onSubmit: (data: EventData) => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
};

export default function CreateEventForm({ onSubmit, onCancel, onClose, isLoading = false }: Props) {
  const now = new Date();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState(formatDateForInput(new Date(now.getTime() + 15 * 60000).toISOString()));
  const [endsAt, setEndsAt] = useState(formatDateForInput(new Date(now.getTime() + 2 * 3600000).toISOString()));
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('fr');

  useEffect(() => {
    const stored = localStorage.getItem('NEXT_LOCALE');
    if (stored) setCurrentLocale(stored);
    else {
      const browser = navigator.language.split('-')[0];
      if (['fr', 'en', 'sw', 'ln', 'pt', 'ar', 'es', 'ko', 'nl'].includes(browser)) setCurrentLocale(browser);
    }
  }, []);

  const isFormValid = useMemo(() => {
    if (!title.trim() || title.length < 3 || !startsAt) return false;
    return new Date(startsAt) > new Date(Date.now() - 120000);
  }, [title, startsAt]);

  const previewUrl = useMemo(() => {
    if (!title) return '';
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/${currentLocale}/events/${slug}-${Date.now().toString(36)}`;
  }, [title, currentLocale]);

  useEffect(() => {
    if (!title || !startsAt) return;
    setIsGeneratingQR(true);
    const timer = setTimeout(() => {
      try {
        const payload = encodeURIComponent(JSON.stringify({ title, starts_at: startsAt, location, is_public: isPublic }).replace(/\s+/g, ''));
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payload}`);
      } catch (e) { console.warn(e); }
      finally { setIsGeneratingQR(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, startsAt, location, isPublic]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return setErrors(p => ({ ...p, location: 'Non supporté' }));
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=${currentLocale}`);
          const data = await res.json();
          setLocation(data.display_name || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch { setLocation('Position inconnue'); }
        finally { setIsLocating(false); }
      },
      (err) => {
        setErrors(p => ({ ...p, location: err.code === 1 ? 'Refusé' : 'Erreur' }));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Requis';
    else if (title.length < 3) e.title = '3 chars min';
    if (!startsAt) e.startsAt = 'Requis';
    else if (new Date(startsAt) <= new Date()) e.startsAt = 'Futur requis';
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) e.endsAt = 'Après début';
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) e.maxParticipants = '1-10000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      starts_at: startsAt,
      ends_at: endsAt || undefined,
      is_public: isPublic,
      max_participants: maxParticipants ? Number(maxParticipants) : undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="glass-border bg-black/40 backdrop-blur-xl border-white/10 w-full shadow-2xl">
        {/* Header Compact */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Créer un événement</h2>
            <p className="text-xs text-gray-400">Configuration rapide</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Ligne 1: Titre */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Titre *
            </label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Conférence Tech" className="bg-white/5 border-white/10 text-sm h-9" maxLength={80} />
            {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
          </div>

          {/* Ligne 2: Dates (Compactes) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Début *</label>
              <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-9" />
              {errors.startsAt && <p className="text-red-400 text-[10px] mt-1">{errors.startsAt}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Fin</label>
              <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-9" min={startsAt} />
              {errors.endsAt && <p className="text-red-400 text-[10px] mt-1">{errors.endsAt}</p>}
            </div>
          </div>

          {/* Ligne 3: Lieu & Participants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Lieu</label>
              <div className="flex gap-2">
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="En ligne ou adresse" className="bg-white/5 border-white/10 text-sm h-9" />
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 text-cyan-400 hover:bg-cyan-500/10" onClick={getCurrentLocation} disabled={isLocating}>
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                </Button>
              </div>
              {errors.location && <p className="text-red-400 text-[10px] mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max</label>
              <Input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value ? Number(e.target.value) : '')} placeholder="Illimité" className="bg-white/5 border-white/10 text-sm h-9" />
              {errors.maxParticipants && <p className="text-red-400 text-[10px] mt-1">{errors.maxParticipants}</p>}
            </div>
          </div>

          {/* Ligne 4: Description & Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="bg-white/5 border-white/10 text-sm resize-none" placeholder="Détails..." />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-sm text-gray-300 select-none">Événement public</span>
              </label>
            </div>
          </div>

          {/* Section QR Code (Compacte) */}
          <div className="mt-2 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Aperçu</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/5 rounded-xl p-4 border border-white/5">
              {/* Info Bulle */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Titre:</span> <span className="text-white font-medium truncate max-w-[120px]">{title || '...'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date:</span> <span className="text-white font-medium">{startsAt ? new Date(startsAt).toLocaleDateString('fr-FR') : '...'}</span></div>
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 break-all">
                  <span className="text-cyan-300 font-mono text-[10px]">luvika.me{previewUrl}</span>
                </div>
              </div>
              
              {/* QR Image */}
              <div className="shrink-0">
                <div className="w-24 h-24 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
                  {isGeneratingQR ? <Loader2 className="w-6 h-6 text-gray-400 animate-spin" /> : qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" /> : <span className="text-[10px] text-gray-400 text-center">Remplir titre & date</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action (Toujours visibles en bas du flux) */}
          <div className="pt-4 mt-2 border-t border-white/5 flex gap-3">
            {(onCancel || onClose) && (
              <Button type="button" variant="outline" onClick={onClose || onCancel} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-10">
                <RotateCcw className="w-4 h-4 mr-2" /> Annuler
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !isFormValid || isGeneratingQR} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white h-10 shadow-lg shadow-cyan-900/20">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Créer l'événement
            </Button>
          </div>
        </form>
      </Card>

      {/* Toast Erreur Global */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 max-w-xs z-[200]">
            <div className="bg-red-950/90 backdrop-blur border border-red-500/50 text-red-100 px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Erreurs détectées</p>
                <ul className="text-xs space-y-1 mt-1 list-disc list-inside opacity-90">
                  {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
