import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// 🔹 POST : créer un événement
export async function POST(request: Request) {
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

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { title, description, location, starts_at, ends_at } = body;
    if (!title || !starts_at) return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });

    // 🔹 ✅ URL CORRECTE — sans espaces, avec `/check-in`
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app').replace(/\s+$/, '').replace(/\/+$/, '');
    const eventId = uuidv4();
    const qrCodeUrl = `${baseUrl}/events/${eventId}/check-in`; // ✅

    const { data : event, error } = await supabase
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
        profile_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard', 'page');
    revalidatePath(`/events/${eventId}/check-in`, 'page');

    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 GET : lister les événements
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

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

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
      // 🔹 ✅ Ajout si absent (fallback)
      qr_code_url: event.qr_code_url || `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.id}/check-in`,
    }));

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}