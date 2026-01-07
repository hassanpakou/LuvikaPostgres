// src/components/dashboard/EventAttendeesSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin, QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/src/lib/supabase/client';
import QRModal from '@/src/components/profile/QRModal';

type Event = {
  id: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  attendee_count: number;
  qr_code_url?: string;
};

type Attendee = {
  id?: string;
  name: string;
  email: string | null;
  scanned_at: string;
};

export default function EventAttendeesSection({ plan }: { plan: string | null }) {
  const isFreePlan = !plan || plan === 'freemium' || plan === 'basic';
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const supabase = createClient();

  // 🔹 CHARGEMENT INITIAL DES ÉVÉNEMENTS (avec compteur)
  useEffect(() => {
    if (isFreePlan) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, location, starts_at, ends_at, attendee_count, qr_code_url')
        .order('starts_at', { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, [isFreePlan]);

  // 🔹 FONCTION 100% REALTIME — PLUS DE FETCH INITIAL POUR LE COMPTEUR
  const loadAttendees = async (event: Event) => {
    setSelectedEvent(event);

    // 1. Charge les participants actuels (une seule fois)
    const { data: attendeesData } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', event.id)
      .order('scanned_at', { ascending: false });

    setAttendees(attendeesData || []);

    // 2. Abonnement Realtime — uniquement sur les nouveaux check-ins
    const channel = supabase
      .channel(`event-${event.id}-attendees`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_attendees',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          const newAttendee = payload.new as Attendee;

          // Mise à jour du compteur dans la liste des événements
          setEvents((prev) =>
            prev.map((e) =>
              e.id === event.id
                ? { ...e, attendee_count: (e.attendee_count || 0) + 1 }
                : e
            )
          );

          // Mise à jour de la liste des participants (si cet événement est sélectionné)
          if (selectedEvent?.id === event.id) {
            setAttendees((prev) => [newAttendee, ...prev]);
          }
        }
      )
      .subscribe();

    // Nettoyage propre
    const cleanup = () => supabase.removeChannel(channel);
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = cleanup;
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const now = new Date();

  if (isFreePlan) {
    return (
      <Card className="glass-border bg-gradient-to-br from-gray-900/50 to-amber-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            Événements (Premium)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Gérez vos événements</h3>
            <p className="text-gray-300 text-sm mb-6">
              QR dédié • Suivi en temps réel • Export CSV
            </p>
            <Button
              className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white"
              onClick={() => (window.location.href = '/dashboard?open=upgrade')}
            >
              Débloquer les événements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="glass-border bg-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Aucun événement pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-border bg-transparent border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-amber-400" />
          Événements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => {
            const starts = new Date(event.starts_at);
            const isOngoing = now >= starts && now <= new Date(event.ends_at);

            return (
              <motion.div
                key={event.id}
                whileHover={{ y: -4 }}
                onClick={() => loadAttendees(event)}
                className={`glass-border p-5 rounded-2xl cursor-pointer transition-all ${
                  selectedEvent?.id === event.id
                    ? 'border-cyan-400/50 bg-cyan-500/5 shadow-cyan-400/20 shadow-xl'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{event.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {starts.toLocaleDateString('fr-FR')} à {starts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* COMPTEUR + QR FLOTTANT ÉLÉGANT */}
                  <div className="flex items-center gap-3 ml-4">
                    <motion.div
                      animate={isOngoing ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-cyan-400/30"
                    >
                      <User className="w-5 h-5 text-cyan-300" />
                      <span className="font-bold text-xl text-white">
                        {event.attendee_count || 0}
                      </span>
                    </motion.div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 h-auto text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowQRModal(true);
                      }}
                      title="Voir le QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {isOngoing && (
                  <div className="mt-3 flex items-center gap-2 text-cyan-300">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium">Check-in en cours</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Liste des participants */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
              <User className="text-cyan-400" />
              Participants à « {selectedEvent.name} »
              <Badge className="ml-2 bg-cyan-500/20 text-cyan-300">
                {selectedEvent.attendee_count} présents
              </Badge>
            </h3>

            {attendees.length === 0 ? (
              <p className="text-gray-400 italic">En attente des premiers participants...</p>
            ) : (
              <div className="space-y-3">
                {attendees.map((att, i) => (
                  <motion.div
                    key={att.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div>
                      <p className="font-medium text-white">{att.name}</p>
                      {att.email && <p className="text-sm text-gray-400">{att.email}</p>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(att.scanned_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </CardContent>

      {/* Modal QR */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profileUrl={
          selectedEvent?.qr_code_url ||
          `https://luvika.app/events/${selectedEvent?.id}/check-in`
        }
        username={selectedEvent?.name || 'Événement'}
      />
    </Card>
  );
}