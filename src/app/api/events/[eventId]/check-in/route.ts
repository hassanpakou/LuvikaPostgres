// src/app/api/events/[eventId]/check-in/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { token } = await request.json();

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token invalide ou manquant' }, { status: 400 });
  }

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

  // Vérifier l’événement
  const { data: event } = await supabase
    .from('events')
    .select('id, starts_at, ends_at, is_public')
    .eq('id', eventId)
    .single();

  if (!event || !event.is_public) {
    return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
  }

  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);

  if (now < startsAt) return NextResponse.json({ error: 'Trop tôt' }, { status: 400 });
  if (now > endsAt) return NextResponse.json({ error: 'Événement terminé' }, { status: 400 });

  // 🔐 Vérifier le token
  const { data: participant } = await supabase
    .from('event_participants')
    .select('id, name, email, is_checked_in')
    .eq('event_id', eventId)
    .eq('qr_token', token)
    .single();

  if (!participant) {
    return NextResponse.json({ error: 'QR code non reconnu' }, { status: 404 });
  }

  if (participant.is_checked_in) {
    return NextResponse.json({ error: 'Déjà scanné' }, { status: 409 });
  }

  // ✅ Enregistrer le check-in
  const { error: updateError } = await supabase
    .from('event_participants')
    .update({
      is_checked_in: true,
      checked_in_at: now.toISOString(),
    })
    .eq('id', participant.id);

  if (updateError) {
    console.error('Supabase update error:', updateError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  // 🔄 Optionnel : compatibilité avec ancienne table
  await supabase.from('event_attendees').insert({
    event_id: eventId,
    name: participant.name,
    email: participant.email,
    scanned_at: now.toISOString(),
  });

  revalidatePath('/dashboard');
  revalidatePath(`/events/${eventId}`);

  return NextResponse.json({ success: true, name: participant.name });
}