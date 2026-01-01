// src/app/api/events/[qrCodeId]/scan/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: Promise<{ qrCodeId: string }> }
) {
  const { qrCodeId } = await context.params;
  const { name, email } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  try {
    // 🔹 Trouve l'événement
    const { data : event } = await supabase
      .from('events')
      .select('id, starts_at, ends_at')
      .eq('qr_code_id', qrCodeId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(event.starts_at)) {
      return NextResponse.json({ error: 'Événement pas encore commencé' }, { status: 400 });
    }
    if (now > new Date(event.ends_at)) {
      return NextResponse.json({ error: 'Événement terminé' }, { status: 400 });
    }

    // 🔹 Tente de récupérer l'ID si utilisateur connecté
    const { data : { user } } = await supabase.auth.getUser();
    const profile_scanned_id = user?.id || null;

    // 🔹 Enregistre la présence
    const { error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: event.id,
        profile_scanned_id,
        name,
        email: email || null,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}