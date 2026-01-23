import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// 🔹 POST : créer un événement + participants si max_participants > 0
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { title, description, location, starts_at, ends_at, max_participants } = body;

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app').replace(/\/+$/, '');
    const eventId = uuidv4();
    const qrCodeUrl = `${baseUrl}/events/${eventId}/check-in`;

    // 🔹 Créer l’événement
    const { data: event, error: insertError } = await supabase
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
        max_participants: max_participants || null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 🔹 Générer des participants avec QR uniques si max_participants défini
    if (max_participants && max_participants > 0) {
      const participants = Array.from({ length: max_participants }, () => ({
        event_id: eventId,
        name: 'Invité',
        qr_token: uuidv4(),
      }));

      const { error: partError } = await supabase.from('event_participants').insert(participants);
      if (partError) console.warn('⚠️ Erreur insertion participants:', partError.message);
    }

    revalidatePath('/dashboard');
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    console.error('❌ Erreur création événement:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 GET : lister uniquement les événements actifs + stats en temps réel (CORRIGÉ)
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

    // Étape 1 : récupérer les événements actifs
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .order('starts_at', { ascending: false });

    if (error) throw error;

    // Étape 2 : compter les présents pour chaque événement
    const eventsWithCount = await Promise.all(
      (events || []).map(async (event) => {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('is_checked_in', true);

        return {
          ...event,
          name: event.title, // pour compatibilité avec le composant
          attendee_count: count || 0,
          qr_code_url:
            event.qr_code_url ||
            `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.id}/check-in`,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('❌ GET events error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}