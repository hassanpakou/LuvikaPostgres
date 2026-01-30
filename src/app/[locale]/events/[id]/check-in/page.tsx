// src/app/[locale]/events/[id]/check-in/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import CheckInClient from '../../../../../components/events/CheckInClient'; // Ajuster le chemin relatif
import { X, Lock, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function LocalizedEventCheckInPage({
  params, // params est un Promise
  searchParams, // searchParams est aussi un Promise
}: {
  params: Promise<{ locale: string; id: string }>; // Typage du Promise pour params
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // Typage du Promise pour searchParams
}) {
  // 🔹 Attendre la résolution des Promises params et searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const eventId = resolvedParams.id; // Accéder à l'ID après avoir résolu le Promise
  // 🔹 Accéder au token après avoir résolu searchParams
  const token = typeof resolvedSearchParams.token === 'string' ? resolvedSearchParams.token : null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        },
      },
    }
  );

  const { data: event } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, is_public, qr_code_url')
    .eq('id', eventId)
    .single();

  if (!event) notFound();

  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);

  // Vérifications de statut
  if (!event.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Card className="glass-border p-8 text-center max-w-md">
          <Lock className="w-12 h-12 mx-auto text-amber-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès privé</h2>
          <p className="text-gray-300">Cet événement est réservé aux invités.</p>
        </Card>
      </div>
    );
  }

  if (now < startsAt) {
    const diff = Math.ceil((startsAt.getTime() - now.getTime()) / 60000);
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Card className="glass-border p-8 text-center max-w-md">
          <Clock className="w-12 h-12 mx-auto text-blue-400 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">⏳ Bientôt !</h2>
          <p className="text-gray-300">
            L’événement « {event.title} » commence dans{' '}
            <span className="text-cyan-300 font-bold">{diff} min</span>.
          </p>
        </Card>
      </div>
    );
  }

  if (now > endsAt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Card className="glass-border p-8 text-center max-w-md">
          <X className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Événement terminé</h2>
          <p className="text-gray-300">Merci d’être venu(e) !</p>
        </Card>
      </div>
    );
  }

  // Passe les données nécessaires au composant client
  return (
    <CheckInClient
      eventId={eventId}
      eventTitle={event.title}
      token={token} // Crucial : transmet le token
      isOrganizer={false}
    />
  );
}