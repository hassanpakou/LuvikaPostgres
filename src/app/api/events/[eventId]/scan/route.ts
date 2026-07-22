// src/app/api/events/[eventId]/scan/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const body = await request.json();
  const { name, email, token } = body;

  // validation minimale
  if (!name && !token) return NextResponse.json({ error: 'Nom ou token requis' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Si token fourni -> utiliser la RPC check_in_participant pour atomiticité
  if (token) {
    const { data, error } = await supabase.rpc('check_in_participant', {
      p_event_id: eventId,
      p_token: token,
      p_name: name ?? null
    });

    if (error) {
      const msg = (error.message || '').toUpperCase();
      if (msg.includes('TOKEN_NOT_FOUND')) return NextResponse.json({ error: 'QR code non reconnu' }, { status: 404 });
      if (msg.includes('ALREADY_CHECKED_IN')) return NextResponse.json({ error: 'Déjà scanné' }, { status: 409 });
      return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
    }

    // Optionel : insert audit log dans event_attendees
    await supabase.from('event_attendees').insert({
      event_id: eventId,
      profile_scanned_id: null,
      name: data?.[0]?.name ?? name,
      email: email ?? null,
      scanned_at: new Date().toISOString(),
      is_anonymous: true
    });

    return NextResponse.json({ success: true, name: data?.[0]?.name });
  }

  // Si pas de token : ancien comportement (insertion dans event_attendees)
  const { data: inserted, error } = await supabase
    .from('event_attendees')
    .insert({ event_id: eventId, profile_scanned_id: null, name: name ?? 'Visiteur', email: email ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  return NextResponse.json({ success: true, attendee: inserted });
}