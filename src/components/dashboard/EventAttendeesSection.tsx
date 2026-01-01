// src/components/dashboard/EventAttendeesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Event = {
  id: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  attendee_count: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('API error');
        const { events } = await res.json();
        setEvents(events);
      } catch (err) {
        console.error('❌ Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    if (!isFreePlan) {
      fetchEvents();
    }
  }, [isFreePlan]);

  const loadAttendees = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const res = await fetch(`/api/events/${event.id}/attendees`);
      if (!res.ok) throw new Error('API error');
      const { attendees } = await res.json();
      setAttendees(attendees);
    } catch (err) {
      console.error('❌ Failed to load attendees', err);
    }
  };

  const now = new Date();

  // 🔹 ✅ Freemium → widget upgrade
  if (isFreePlan) {
    return (
      <Card className="glass-border bg-gradient-to-br from-gray-900/50 to-amber-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            🗓️ Événements (Premium)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Gérez vos événements</h3>
            <p className="text-gray-300 text-sm mb-4">
              Créez des événements, générez des QR, suivez les présents en temps réel.
            </p>
            <ul className="text-left text-gray-400 text-xs space-y-1 mb-6 max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                QR dédié par événement
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Liste des participants
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Statistiques en temps réel
              </li>
            </ul>
            <Button
              variant="default"
              className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white"
              onClick={() => {
                window.location.href = '/dashboard?open=upgrade';
              }}
            >
              🚀 Débloquer les événements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🔹 ✅ Chargement
  if (loading) {
    return (
      <Card className="glass-border bg-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            🗓️ Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  // 🔹 ✅ Contenu principal
  return (
    <Card className="glass-border bg-transparent border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-amber-400" />
          🗓️ Événements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Aucun événement pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map(event => {
                const starts = new Date(event.starts_at);
                const ends = new Date(event.ends_at);
                const isOngoing = now >= starts && now <= ends;
                const isUpcoming = now < starts;

                return (
                  <motion.div
                    key={event.id} // ✅ UNIQUE
                    whileHover={{ y: -2 }}
                    className={`glass-border p-4 rounded-xl cursor-pointer ${
                      selectedEvent?.id === event.id
                        ? 'border-amber-400/50 bg-amber-400/5'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => loadAttendees(event)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white">{event.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`px-2 py-0.5 text-xs ${
                          isOngoing
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isUpcoming
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {isOngoing ? 'En cours' : isUpcoming ? 'À venir' : 'Terminé'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {starts.toLocaleDateString()} · {starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-sm text-cyan-300">{event.attendee_count} présents</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedEvent && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <User className="text-cyan-400" />
                  Participants à « {selectedEvent.name} »
                </h3>
                {attendees.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun participant pour le moment</p>
                ) : (
                  <ul className="space-y-2">
                    {attendees.map(att => (
                      <li
                        key={att.id || `${att.name}-${att.scanned_at}`} // ✅ UNIQUE
                        className="flex items-center justify-between p-3 glass-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{att.name}</p>
                          {att.email && <p className="text-sm text-gray-400">{att.email}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {new Date(att.scanned_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(att.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}