'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

// 🔹 Typage mis à jour — eventTitle optionnel
type Props = {
  eventId: string;
  isOrganizer: boolean;
  eventTitle?: string;
};

export default function CheckInClient({ eventId, isOrganizer, eventTitle }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const recordAttendance = async () => {
      setStatus('loading');
      try {
        // 🔹 ✅ Appel à la bonne API (POST /api/events/[eventId]/attendees)
        const response = await fetch(`/api/events/${eventId}/attendees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: 'Visiteur anonyme', // ou champ input si besoin
            email: null 
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Échec de l’enregistrement');
        }

        setStatus('success');
      } catch (err) {
        console.error('❌ Échec du check-in:', err);
        setStatus('error');
      }
    };

    recordAttendance();
  }, [eventId]);

  // 🔹 Redirection automatique après succès (optionnel)
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        if (isOrganizer) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, isOrganizer, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-gradient-to-br from-gray-900 to-black">
      <Card className="glass-border w-full max-w-md p-6 sm:p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mb-6">
          {status === 'loading' ? (
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : status === 'success' ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          ) : status === 'error' ? (
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-400">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6L14,9H10L12,6M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17Z" />
              </svg>
            </div>
          ) : null}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
          {status === 'loading' && t('event.checkin.success')}
          {status === 'success' && t('event.checkin.success')}
          {status === 'error' && '❌ Échec du check-in'}
        </h1>

        <p className="text-gray-300 mb-6">
          {status === 'loading' && 'Enregistrement en cours…'}
          {status === 'success' && t('event.checkin.thanks', { title: eventTitle || 'événement' })}
          {status === 'error' && 'Une erreur est survenue. Veuillez réessayer.'}
        </p>

        {status === 'success' && !isOrganizer && (
          <p className="text-cyan-300 text-sm mb-6">
            Redirection vers l’accueil dans 3 secondes…
          </p>
        )}

        {isOrganizer && status === 'success' && (
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
            <Link href="/dashboard">
              {t('event.checkin.view_participants')}
            </Link>
          </Button>
        )}

        {status === 'error' && (
          <Button
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        )}
      </Card>
    </div>
  );
}