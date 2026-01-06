import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// 🔹 POST : créer un événement — ✅ CORRIGÉ
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // 🔹 ✅ Nouvelle API — seulement getAll + setAll
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set({ name, value, ...options })
              );
            } catch (error) {
              // Safe to ignore in SSR (streaming already started)
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { title, description, location, starts_at, ends_at } = body;
    if (!title || !starts_at) return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });

    // 🔹 ✅ URL VRAIE — route publique existante
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://luvika.vercel.app';
    const eventId = uuidv4();
    const qrCodeUrl = `${baseUrl}/events/${eventId}/check-in`; // ✅ /events/xxx/check-in

    const { data, error } = await supabase
      .from('events')
      .insert({
        id: eventId,
        title,
        description: description || null,
        location: location || null,
        starts_at,
        ends_at,
        qr_code_url: qrCodeUrl,
        is_public: true,
        max_participants: null,
        profile_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // 🔹 ✅ Rafraîchit le dashboard immédiatement
    revalidatePath('/dashboard', 'page');
    revalidatePath(`/events/${eventId}/check-in`, 'page');

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('❌ Création échouée:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}

// 🔹 GET : lister les événements — ✅ CORRIGÉ
export async function GET() {
  try {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, location, starts_at, ends_at,
        attendee_count: event_attendees(count)
      `)
      .eq('profile_id', user.id)
      .order('starts_at', { ascending: false });

    if (error) throw error;

    const eventsWithCount = (data || []).map(event => ({
      ...event,
      attendee_count: Array.isArray(event.attendee_count)
        ? event.attendee_count[0]?.count || 0
        : event.attendee_count,
    }));

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('❌ Liste échouée:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}
