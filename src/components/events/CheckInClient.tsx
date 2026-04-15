'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Loader2, QrCode, User, AlertCircle, Users, Wifi, WifiOff,
  CheckCircle, XCircle, Clock, Lock, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type CheckInClientProps = {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  endsAt: string;
  isPublic: boolean;
  token: string | null;
  isOrganizer: boolean;
  requiresName?: boolean;
};

export default function CheckInClient({
  eventId,
  eventTitle,
  startsAt,
  endsAt,
  isPublic,
  token,
  isOrganizer,
  requiresName = false,
}: CheckInClientProps) {
  // États pour le formulaire de check-in
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [inputName, setInputName] = useState('');

  // États pour le compte à rebours et statut événement
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

  // États pour le compteur de participants en temps réel
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  const supabase = createClient();

  // 🔹 Compte à rebours dynamique
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const start = new Date(startsAt);
      const end = new Date(endsAt);

      if (now < start) {
        const diffMs = start.getTime() - now.getTime();
        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeRemaining({ minutes, seconds });
        setEventStatus('upcoming');
      } else if (now >= start && now <= end) {
        setTimeRemaining(null);
        setEventStatus('live');
      } else {
        setTimeRemaining(null);
        setEventStatus('ended');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [startsAt, endsAt]);

  // 🔹 Charger le nombre initial de participants (uniquement si l'événement est public)
  useEffect(() => {
    if (!isPublic) {
      setLoadingCount(false);
      return;
    }

    const fetchInitialCount = async () => {
      const { count, error } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (!error) {
        setParticipantsCount(count || 0);
      }
      setLoadingCount(false);
    };
    fetchInitialCount();
  }, [eventId, isPublic]);

  // 🔹 Abonnement Realtime pour les participants (événements publics uniquement)
  useEffect(() => {
    if (!isPublic) return;

    const channel = supabase
      .channel(`event-participants-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('🔄 Nouveau participant inscrit:', payload.new);
          setParticipantsCount(prev => (prev !== null ? prev + 1 : 1));
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, isPublic]);

  // 🔹 Gestion du check-in (appel à l'API existante)
  const handleCheckIn = async () => {
    if (!token) {
      setMessage('QR code invalide. Veuillez scanner un QR valide.');
      setStatus('error');
      return;
    }

    if (requiresName && !inputName.trim()) {
      setMessage('Veuillez entrer votre nom.');
      setStatus('error');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: requiresName ? inputName.trim() : undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(`✅ Bienvenue, ${data.name || 'participant'} !`);
        toast.success('Check-in réussi !');
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur lors du check-in.');
        toast.error(data.error || 'Échec du check-in');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setStatus('error');
      setMessage('Erreur réseau. Impossible de joindre le serveur.');
      toast.error('Erreur réseau');
    }
  };

  // 🔹 Rendu conditionnel selon le statut de l'événement
  if (eventStatus === 'upcoming' && timeRemaining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20 p-4">
        <Card className="glass-border p-8 text-center max-w-md">
          <Clock className="w-16 h-16 mx-auto text-cyan-400 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">⏳ Bientôt !</h2>
          <p className="text-gray-300 text-lg">
            L'événement « {eventTitle} » commence dans
          </p>
          <div className="mt-4 text-4xl font-mono font-bold text-cyan-300">
            {timeRemaining.minutes.toString().padStart(2, '0')}:
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-400 mt-2">minutes : secondes</p>
        </Card>
      </div>
    );
  }

  if (eventStatus === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20 p-4">
        <Card className="glass-border p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Événement terminé</h2>
          <p className="text-gray-300">Merci d'être venu(e) !</p>
        </Card>
      </div>
    );
  }

  if (!isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20 p-4">
        <Card className="glass-border p-8 text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accès privé</h2>
          <p className="text-gray-300">Cet événement est réservé aux invités.</p>
        </Card>
      </div>
    );
  }

  // 🔹 Écran principal (événement en cours et public)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* En-tête avec titre et compteur */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm mb-4">
            <QrCode className="w-4 h-4" />
            Check-in événement
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {eventTitle}
          </h1>

          {/* Compteur de participants */}
          {!loadingCount && participantsCount !== null && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Card className="glass-border bg-white/5 border-white/10 px-6 py-3 inline-flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{participantsCount}</span>
                <span className="text-gray-400 text-sm">participant{participantsCount !== 1 ? 's' : ''}</span>

                <div className={`flex items-center gap-1 ml-2 px-2 py-1 rounded-full text-xs ${
                  isRealtimeActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {isRealtimeActive ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Hors ligne</span>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          {loadingCount && (
            <div className="mt-4">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
            </div>
          )}
        </motion.div>

        {/* Carte de check-in */}
        {status === 'success' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Card className="glass-border bg-emerald-900/20 border-emerald-500/30 p-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Présence enregistrée !</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-400 mt-4">Profitez de l'événement 🎉</p>
            </Card>
          </motion.div>
        ) : (
          <Card className="glass-border w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
              <CardTitle className="text-white">{eventTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {requiresName && (
                <div className="mb-4">
                  <label htmlFor="check-in-name" className="block text-sm font-medium text-gray-300 mb-2">
                    Votre nom complet *
                  </label>
                  <Input
                    id="check-in-name"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Entrez votre nom"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              )}
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                </div>
              )}
              <Button
                onClick={handleCheckIn}
                disabled={status === 'checking' || !token}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {status === 'checking' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enregistrer ma présence
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              {!token && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  ❗ Ce QR code n'est pas valide. Assurez-vous de scanner le bon lien.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}