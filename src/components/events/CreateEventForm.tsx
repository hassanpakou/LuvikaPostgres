'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Hash, Link as LinkIcon, QrCode, Send, RotateCcw,
  Locate, Clock, Tag, AlertCircle, Loader2, ChevronRight, ChevronLeft, Globe, Shield, CheckCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';

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
  
  // États du formulaire
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState(formatDateForInput(new Date(now.getTime() + 15 * 60000).toISOString()));
  const [endsAt, setEndsAt] = useState(formatDateForInput(new Date(now.getTime() + 2 * 3600000).toISOString()));
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  
  // États utilitaires
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('fr');

  // Initialisation Locale
  useEffect(() => {
    const stored = localStorage.getItem('NEXT_LOCALE');
    if (stored) setCurrentLocale(stored);
    else {
      const browser = navigator.language.split('-')[0];
      if (['fr', 'en', 'sw', 'ln', 'pt', 'ar', 'es', 'ko', 'nl'].includes(browser)) setCurrentLocale(browser);
    }
  }, []);

  // --- VALIDATIONS PAR ÉTAPE ---

  // Étape 1 : Champs critiques
  const isStep1Valid = useMemo(() => {
    if (!title.trim() || title.length < 3) return false;
    if (!startsAt) return false;
    if (new Date(startsAt) <= new Date(Date.now() - 120000)) return false;
    return true;
  }, [title, startsAt]);

  // Étape 2 : Champs secondaires (optionnels mais validés si remplis)
  const isStep2Valid = useMemo(() => {
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) return false;
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) return false;
    return true;
  }, [endsAt, startsAt, maxParticipants]);

  // Validation Globale (pour soumission finale)
  const isFormValid = useMemo(() => {
    return isStep1Valid && isStep2Valid;
  }, [isStep1Valid, isStep2Valid]);

  // URL Prévisualisation
  const previewUrl = useMemo(() => {
    if (!title) return '';
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/${currentLocale}/events/${slug}-${Date.now().toString(36)}`;
  }, [title, currentLocale]);

  // Génération QR Code (Uniquement étape 3 ou pré-génération silencieuse)
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

  // Géolocalisation
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

  // Gestion des erreurs et navigation
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Requis';
    else if (title.length < 3) e.title = '3 chars min';
    if (!startsAt) e.startsAt = 'Requis';
    else if (new Date(startsAt) <= new Date()) e.startsAt = 'Futur requis';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) e.endsAt = 'Après début';
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) e.maxParticipants = '1-10000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    
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
      <Card className="glass-border bg-black/40 backdrop-blur-xl border-white/10 w-full shadow-2xl overflow-hidden">
        
        {/* Header avec Indicateur d'Étapes (3 steps) */}
        <div className="p-5 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {step === 1 ? "Informations de base" : step === 2 ? "Détails & Options" : "Aperçu & Validation"}
                </h2>
                <p className="text-xs text-gray-400">
                  {step === 1 ? "L'essentiel pour commencer" : step === 2 ? "Personnalisez votre événement" : "Vérifiez et créez"}
                </p>
              </div>
            </div>
            
            {/* Badges d'étapes */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  step === i 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 scale-105' 
                    : step > i 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/5 text-gray-500'
                }`}>
                  {step > i ? <CheckCircle className="w-3 h-3" /> : <span>{i}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Barre de progression dynamique */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            
            {/* ================= ÉTAPE 1 : BASES ================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Titre de l'événement *
                  </label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Conférence Tech Kinshasa" className="bg-white/5 border-white/10 text-sm h-10" maxLength={80} autoFocus />
                  {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Début *</label>
                    <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-10" />
                    {errors.startsAt && <p className="text-red-400 text-[10px] mt-1">{errors.startsAt}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Fin (Optionnel)</label>
                    <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-10" min={startsAt} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Lieu</label>
                  <div className="flex gap-2">
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Adresse ou 'En ligne'" className="bg-white/5 border-white/10 text-sm h-10" />
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-cyan-400 hover:bg-cyan-500/10 shrink-0" onClick={getCurrentLocation} disabled={isLocating}>
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.location && <p className="text-red-400 text-[10px] mt-1">{errors.location}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={handleNext} disabled={!isStep1Valid} className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    Suivant <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 2 : DÉTAILS ================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Description</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="bg-white/5 border-white/10 text-sm resize-none" placeholder="Détails, programme, objectifs..." />
                  <p className="text-right text-[10px] text-gray-500 mt-1">{description.length} caractères</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max participants</label>
                    <Input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value ? Number(e.target.value) : '')} placeholder="Illimité" className="bg-white/5 border-white/10 text-sm h-10" />
                    {errors.maxParticipants && <p className="text-red-400 text-[10px] mt-1">{errors.maxParticipants}</p>}
                  </div>
                  
                  <div className="flex flex-col justify-end pb-1">
                     <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPublic ? <Globe className="w-4 h-4 text-green-400" /> : <Shield className="w-4 h-4 text-gray-400" />}
                        <div>
                          <p className="text-sm font-bold text-white">Public</p>
                          <p className="text-[10px] text-gray-400">{isPublic ? "Visible par tous" : "Sur invitation"}</p>
                        </div>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-green-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                  </Button>
                  <Button type="button" onClick={handleNext} disabled={!isStep2Valid} className="flex-[2] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    Voir l'aperçu <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 3 : APERÇU & QR ================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Récapitulatif
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div className="text-gray-400">Titre:</div>
                    <div className="text-white font-medium truncate">{title}</div>
                    
                    <div className="text-gray-400">Date:</div>
                    <div className="text-white font-medium">{startsAt ? new Date(startsAt).toLocaleDateString('fr-FR') : '...'}</div>
                    
                    <div className="text-gray-400">Lieu:</div>
                    <div className="text-white font-medium truncate">{location || 'Non défini'}</div>
                    
                    <div className="text-gray-400">Visibilité:</div>
                    <div className="text-white font-medium">
                      <Badge variant={isPublic ? "default" : "secondary"} className="text-[10px] h-5">
                        {isPublic ? 'Public' : 'Privé'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-purple-400" /> Votre QR Code Intelligent
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/20 rounded-xl p-5 border border-white/5">
                    <div className="shrink-0 relative group">
                      <div className="w-32 h-32 bg-white rounded-xl p-2 shadow-xl shadow-cyan-500/10 flex items-center justify-center relative overflow-hidden">
                        {isGeneratingQR ? (
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : qrDataUrl ? (
                          <>
                            <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain mix-blend-multiply" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <span className="text-white text-[10px] font-bold">SCAN ME</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 text-center px-2">Génération...</span>
                        )}
                      </div>
                      <p className="text-center text-[10px] text-gray-500 mt-2">Scan → Check-in auto</p>
                    </div>

                    <div className="flex-1 w-full space-y-2 text-xs">
                       <div className="p-2.5 bg-cyan-500/10 rounded border border-cyan-500/20 break-all">
                        <span className="text-cyan-300 font-mono text-[10px]">luvika.me{previewUrl}</span>
                      </div>
                      <p className="text-gray-400 italic">
                        Ce QR code sera actif dès la création. Vous pourrez le télécharger et l'imprimer pour vos affiches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Modifier
                  </Button>
                  <Button type="submit" disabled={isLoading || !isFormValid || isGeneratingQR} className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white h-11 shadow-lg shadow-green-900/20">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Créer l'événement
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Card>

      {/* Toast Erreur Global (Uniquement si étape 1 ou 2) */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && step < 3 && (
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
