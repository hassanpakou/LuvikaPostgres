// src/app/api/events/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // ✅ Fournir une valeur par défaut pour ends_at si non fourni
    const defaultEndsAt = ends_at || new Date(new Date(starts_at).getTime() + 2 * 3600000).toISOString();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        profile_id: user.id,
        title,
        description: description || null,
        location: location || null,
        starts_at,
        ends_at: defaultEndsAt, // ✅ Toujours une valeur
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