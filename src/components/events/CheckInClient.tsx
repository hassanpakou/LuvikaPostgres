// src/components/events/CheckInClient.tsx
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckInClient({ eventId, isOrganizer }: { eventId: string; isOrganizer: boolean }) {
  const t = useTranslations();
  const router = useRouter();

  // ✅ Enregistre la présence côté client
  useEffect(() => {
    const recordAttendance = async () => {
      try {
        await fetch('/api/events/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
      } catch (err) {
        console.warn('Échec de l’enregistrement de la présence', err);
      }
    };

    recordAttendance();
  }, [eventId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-border p-8 max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4">
          {t('event.checkin.success')}
        </h1>
        <p className="text-gray-300 mb-6">
          {t('event.checkin.thanks', { title: 'événement' })}
        </p>
        {isOrganizer && (
          <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500">
            <Link href="/dashboard">
              {t('event.checkin.view_participants')}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}