// src/app/api/events/[eventId]/check-in/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) { // ✅ 'eventId'
  const { eventId } = await params; // ✅ Extraire 'eventId'
  const { token, name } = await request.json();

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

const { data, error } = await supabase.rpc('check_in_participant', {
  p_event_id: eventId,
  p_token: token,
  p_name: name
});

// si erreur fournie par supabase.rpc
if (error) {
  console.error('RPC check_in_participant error:', error);

  const msg = (error.message || '').toUpperCase();

  if (msg.includes('TOKEN_NOT_FOUND')) {
    return NextResponse.json({ error: 'QR code non reconnu' }, { status: 404 });
  }
  if (msg.includes('ALREADY_CHECKED_IN')) {
    return NextResponse.json({ error: 'Déjà scanné' }, { status: 409 });
  }
  if (msg.includes('EVENT_NOT_FOUND') || msg.includes('EVENT_NOT_ACTIVE')) {
    return NextResponse.json({ error: 'Événement non valide ou pas actif' }, { status: 400 });
  }
  // autres erreurs connues/attendues
  return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
}

// RPC renvoie normalement une ligne/objet avec name, checked_in_at
return NextResponse.json({ success: true, name: data?.[0]?.name ?? name, checked_in_at: data?.[0]?.checked_in_at ?? new Date().toISOString() });
}