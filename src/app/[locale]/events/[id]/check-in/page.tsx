'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Users, RefreshCw, CheckCircle, XCircle, Wifi, WifiOff, 
  UserPlus, QrCode, ArrowRight, Lock, Clock 
} from 'lucide-react';

type CheckInClientProps = {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  endsAt: string;
  isPublic: boolean;
  token: string | null;
  isOrganizer: boolean;
  requiresName: boolean;
};

export default function CheckInClient({ 
  eventId, eventTitle, startsAt, endsAt, isPublic, token, requiresName 
}: CheckInClientProps) {
  const [participantName, setParticipantName] = useState('');
  const [email, setEmail] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  // États pour le compte à rebours
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

  const supabase = createClient();

  // 🔹 Calculer le statut initial et le temps restant
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

  // 🔹 Charger le nombre initial de participants (seulement si l'événement est public ou live ? On peut le faire dans tous les cas)
  useEffect(() => {
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
  }, [eventId]);

  // 🔹 Abonnement Realtime
  useEffect(() => {
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
  }, [eventId]);

  // 🔹 Gestion du check-in
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim() && requiresName) {
      setError('Le nom est requis pour cet événement privé.');
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const payload: any = {
        event_id: eventId,
        name: participantName.trim() || 'Invité',
        email: email.trim() || null,
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
      };

      if (token) {
        payload.qr_token = token;
      }

      const { error } = await supabase
        .from('event_participants')
        .insert(payload);

      if (error) throw error;

      setCheckedIn(true);
      toast.success('✅ Check-in réussi !');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors du check-in');
      toast.error('❌ Échec du check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // 🔹 Rendu conditionnel selon le statut
  if (eventStatus === 'upcoming' && timeRemaining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
        <Card className="glass-border p-8 text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accès privé</h2>
          <p className="text-gray-300">Cet événement est réservé aux invités.</p>
        </Card>
      </div>
    );
  }

  // 🔹 Affichage pendant le chargement initial du compteur
  if (loadingCount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {!checkedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-border bg-white/5 border-white/10 p-6 md:p-8">
              <form onSubmit={handleCheckIn} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Confirmez votre présence</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {requiresName 
                      ? 'Veuillez indiquer votre nom pour valider votre participation.' 
                      : 'Vous pouvez vous enregistrer anonymement.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Votre nom {requiresName && <span className="text-red-400">*</span>}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={requiresName ? 'John Doe' : 'Invité (optionnel)'}
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      required={requiresName}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email (optionnel)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pour recevoir une confirmation par email.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isCheckingIn}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300"
                >
                  {isCheckingIn ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmer mon check-in
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-border bg-emerald-900/20 border-emerald-500/30 p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">✅ Check-in confirmé !</h2>
              <p className="text-gray-300 mb-6">
                Merci {participantName || 'd’être venu(e)'} ! Votre présence a bien été enregistrée.
              </p>
              <p className="text-sm text-gray-400">
                Profitez de l'événement 🎉
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}