// src/app/api/events/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id'); // optionnel

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // ✅ Utilise profile_id si fourni, sinon utilise l'ID de l'utilisateur connecté
    const queryProfileId = profileId || user.id;

    let query = supabase
      .from('events')
      .select('*')
      .eq('profile_id', queryProfileId)
      .order('starts_at', { ascending: false });

    // ✅ Si un profile_id externe est passé, on filtre aussi par is_public = true
    // (pour ne pas exposer les événements privés d'un autre utilisateur)
    if (profileId && profileId !== user.id) {
      query = query.eq('is_public', true).eq('status', 'active');
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur récupération événements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const eventsWithCount = await Promise.all(
      (events || []).map(async (event) => {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('is_checked_in', true);

        return {
          ...event,
          name: event.title,
          attendee_count: count || 0,
          qr_code_url: `/${searchParams.get('locale') || 'fr'}/events/${event.id}/check-in`,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('Erreur API events GET:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, location, starts_at, ends_at, is_public, max_participants } = data;

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Titre et date de début requis' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const defaultEndsAt = ends_at || new Date(new Date(starts_at).getTime() + 2 * 3600000).toISOString();

    const { data: event, error } = await supabase
    .from('events')
    .insert({
      profile_id: user.id,
      title,
      description: description || null,
      location: location || null,
      starts_at, // ✅ Déjà en UTC depuis le frontend
      ends_at: ends_at || new Date(new Date(starts_at).getTime() + 2 * 3600000).toISOString(),
      is_public: is_public ?? true,
      max_participants: max_participants || null,
      status: 'active',
    })
    .select()
    .single();

    if (error) {
      console.error('Erreur création événement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error('Erreur API events:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}