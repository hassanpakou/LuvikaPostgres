// src/app/api/events/route.ts
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
    const { title, description, location, starts_at, ends_at, max_participants, is_public } = body;

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });
    }

    const eventId = uuidv4();

    // 🔹 Créer l’événement SANS l'URL complète du QR Code
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        title,
        description: description || null,
        location: location || null,
        starts_at,
        ends_at,
        // qr_code_url: qrCodeUrl, // ❌ NE PAS INSÉRER L'URL ICI
        is_public: is_public !== false ? true : false,
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
    // 🔹 Retourner l'événement sans l'URL du QR Code (ou avec une valeur par défaut si nécessaire ailleurs)
    // L'URL sera reconstruite dans le frontend avec la locale.
    // On peut s'assurer que qr_code_url est explicitement null dans la réponse si besoin.
    return NextResponse.json({ ...event, id: eventId, qr_code_url: null }, { status: 201 });
  } catch (err: any) {
    console.error('❌ Erreur création événement:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 GET : lister uniquement les événements actifs + stats en temps réel
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
      .select('*') // Cela inclura qr_code_url (qui sera null pour les nouveaux événements)
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
          // qr_code_url: event.qr_code_url, // Laisser tel quel, sera null pour les nouveaux
        };
      })
    );

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('❌ GET events error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}