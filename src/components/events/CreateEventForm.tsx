// src/components/events/CreateEventForm.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Hash, Link, QrCode, Send, CheckCircle, RotateCcw,
  Map, Locate, Clock, Tag, AlertCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 🔹 Types
type EventData = {
  title: string;
  description?: string;
  location?: string;
  starts_at: string; // ISO 8601
  ends_at?: string;
  is_public: boolean;
  max_participants?: number;
};

type GeoLocation = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  onSubmit: (data: EventData) => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void; // ✅ déclaré
  isLoading?: boolean;
};

// 🔹 Composant principal
export default function CreateEventForm({
  onSubmit,
  onCancel,
  onClose, // ✅ ajouté
  isLoading = false,
}: Props) {
  // 🔹 États
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const previewUrl = useMemo(() => {
    if (!title) return '';
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/event/${slug}-${Date.now().toString(36)}`;
  }, [title]);

  // 🔹 Validation temps réel
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Le titre est obligatoire';
    else if (title.length < 3) newErrors.title = '3 caractères minimum';
    
    if (!startsAt) newErrors.startsAt = 'La date de début est obligatoire';
    else {
      const start = new Date(startsAt);
      const now = new Date();
      if (start <= now) newErrors.startsAt = 'Doit être dans le futur';
    }
    
    if (endsAt) {
      const end = new Date(endsAt);
      const start = new Date(startsAt);
      if (end <= start) newErrors.endsAt = 'Doit être après le début';
    }
    
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) {
      newErrors.maxParticipants = 'Entre 1 et 10 000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Génération QR en temps réel
  useEffect(() => {
    if (!title || !startsAt) return;
    
    setIsGeneratingQR(true);
    const timer = setTimeout(async () => {
      try {
        const data = JSON.stringify({
          title,
          starts_at: startsAt,
          location,
          is_public: isPublic,
        });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
        setQrDataUrl(qrUrl);
      } catch (err) {
        console.warn('⚠️ QR fallback');
        setQrDataUrl(null);
      } finally {
        setIsGeneratingQR(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [title, startsAt, location, isPublic]);

  // 🔹 Géolocalisation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Géolocalisation non supportée' }));
      return;
    }
    
    setUseCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setGeoLocation({ lat: latitude, lng: longitude, address });
          setLocation(address);
        } catch (err) {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setGeoLocation({ lat: latitude, lng: longitude });
        }
        setUseCurrentLocation(false);
      },
      (err) => {
        setErrors(prev => ({ ...prev, location: 'Impossible d’accéder à la localisation' }));
        setUseCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🔹 Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const data: EventData = {
      title,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      starts_at: startsAt,
      ends_at: endsAt || undefined,
      is_public: isPublic,
      max_participants: maxParticipants ? Number(maxParticipants) : undefined,
    };
    
    await onSubmit(data);
  };

  // 🔹 Helpers UI
  const formatDateForInput = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  const nowIn15Min = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return formatDateForInput(d.toISOString());
  };

  // 🔹 Initialisation date
  useEffect(() => {
    if (!startsAt) setStartsAt(nowIn15Min());
    if (!endsAt) {
      const d = new Date();
      d.setHours(d.getHours() + 2);
      setEndsAt(formatDateForInput(d.toISOString()));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass-border bg-black/20 backdrop-blur-xl border-white/10">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Créer un événement</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Générez un QR Code intelligent pour gérer les présences en temps réel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 🔹 Section 1 : Informations */}
          <div className="space-y-5">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Titre *
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Conférence Tech, Atelier NFC..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                maxLength={100}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Description
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Détails, programme, objectifs..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-gray-500 text-xs text-right mt-1">{description.length}/500</p>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Lieu
              </label>
              <div className="flex gap-2">
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Kinshasa, Hôtel Pullman..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-white/20 text-cyan-300 hover:bg-white/10"
                  onClick={getCurrentLocation}
                  disabled={useCurrentLocation}
                >
                  {useCurrentLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                </Button>
              </div>
              {errors.location && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.location}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Début *
                </label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.startsAt && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.startsAt}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Fin
                </label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  min={startsAt || undefined}
                />
                {errors.endsAt && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.endsAt}</p>}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Max. participants
                </label>
                <Input
                  type="number"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                  placeholder="100"
                  className="bg-white/5 border-white/10 text-white"
                  min="1"
                  max="10000"
                />
                {errors.maxParticipants && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.maxParticipants}</p>}
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300 text-sm">Événement public</span>
                </label>
              </div>
            </div>
          </div>

          {/* 🔹 Section 2 : Prévisualisation QR */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <QrCode className="text-cyan-400" /> Prévisualisation QR Code
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 🔸 Données */}
              <Card className="glass-border bg-white/5 border-white/10">
                <div className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Titre</span>
                      <span className="text-white font-medium truncate max-w-[150px]">{title || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Début</span>
                      <span className="text-white font-medium">
                        {startsAt ? new Date(startsAt).toLocaleString('fr-FR') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lieu</span>
                      <span className="text-white font-medium truncate max-w-[120px]">{location || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Public</span>
                      <Badge variant={isPublic ? "default" : "secondary"}>
                        {isPublic ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <p className="text-cyan-300 text-xs flex items-center gap-1">
                      <Link className="w-3 h-3" /> luvika.me{previewUrl}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 🔸 QR Code */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center">
                  {isGeneratingQR ? (
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  ) : qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code événement" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center text-xs">
                      Remplissez le titre et la date<br />pour générer le QR
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">
                  Scan → Check-in automatique
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                onClick={onClose || onCancel}>

                <RotateCcw className="w-4 h-4 mr-2" /> Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !validate() || isGeneratingQR}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Créer l’événement
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 🔹 Tooltip glace */}
      <AnimatePresence>
        {Object.values(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 max-w-xs p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200 text-sm"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Corrigez les erreurs</p>
                <ul className="mt-1 space-y-1">
                  {Object.entries(errors).map(([key, msg]) => (
                    <li key={key} className="flex items-center gap-1">
                      • {msg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}