// src/app/api/events/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 🔹 POST : créer un événement
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set({ name, value, ...options }); },
          remove(name, options) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { title, description, location, starts_at, ends_at } = body;
    if (!title || !starts_at) return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app').replace(/\/+$/, '');
    const eventId = uuidv4();
    const qrCodeUrl = `${baseUrl}/event/${eventId}`; // ✅ Déclaré

const { data, error } = await supabase
  .from('events')
  .insert({
    id: eventId,
    title,
    description: description || null,
    location: location || null,
    starts_at,
    ends_at,
    qr_code_url: qrCodeUrl, // ✅ Correction ici
    is_public: true,
    max_participants: null,
    profile_id: user.id,
    updated_at: new Date().toISOString(),
  })
  .select()
  .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('❌ Création échouée:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}

// 🔹 GET : lister les événements de l'utilisateur
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // 🔹 ✅ Sélection avec compte participants
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        attendee_count: event_attendees(count)
      `)
      .eq('profile_id', user.id)
      .order('starts_at', { ascending: false });

    if (error) throw error;

    const eventsWithCount = (data || []).map(event => ({
      ...event,
      attendee_count: event.attendee_count?.count || 0,
    }));

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('❌ Liste échouée:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}