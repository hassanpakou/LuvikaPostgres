'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, X as XIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Props = {
  eventId: string;
  isOrganizer: boolean;
  eventTitle?: string; // ✅ optionnel
};

export default function CheckInClient({ eventId, isOrganizer, eventTitle }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const recordAttendance = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`/api/events/${eventId}/attendees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Visiteur', email: null }),
        });

        if (!res.ok) throw new Error('Échec');
        setStatus('success');
      } catch (err) {
        console.error('❌ Check-in échoué:', err);
        setStatus('error');
      }
    };

    recordAttendance();
  }, [eventId]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        router.push(isOrganizer ? '/dashboard' : '/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, isOrganizer, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br">
      <Card className="glass-border w-full max-w-md p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col items-center">
          {status === 'loading' && (
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <XIcon className="w-7 h-7 text-red-400" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          {status === 'loading' && 'Enregistrement…'}
          {status === 'success' && '✅ Présence confirmée !'}
          {status === 'error' && '❌ Échec'}
        </h1>

        <p className="text-gray-300 text-center mb-5">
          {status === 'loading' && 'Un instant…'}
          {status === 'success' && `Merci d’avoir rejoint « ${eventTitle || 'l’événement'} »`}
          {status === 'error' && 'Réessayez ou contactez l’organisateur.'}
        </p>

        {status === 'success' && !isOrganizer && (
          <p className="text-cyan-300 text-sm text-center">Redirection dans 3s…</p>
        )}

        {status === 'error' && (
          <Button
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => router.refresh()}
          >
            🔄 Réessayer
          </Button>
        )}
      </Card>
    </div>
  );
}