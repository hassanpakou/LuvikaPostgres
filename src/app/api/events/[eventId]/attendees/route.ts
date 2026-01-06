// src/app/api/events/[eventId]/attendees/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const { name, email } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔹 Vérifie l’événement (pas besoin d’auth — public check-in)
  const { data : event } = await supabase
    .from('events')
    .select('id, starts_at, ends_at, is_public')
    .eq('id', eventId)
    .single();

  if (!event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
  if (!event.is_public) return NextResponse.json({ error: 'Accès privé' }, { status: 403 });

  const now = new Date();
  if (now < new Date(event.starts_at)) return NextResponse.json({ error: 'Pas encore commencé' }, { status: 400 });
  if (now > new Date(event.ends_at)) return NextResponse.json({ error: 'Terminé' }, { status: 400 });

  // 🔹 Récupère l’ID utilisateur si connecté (optionnel)
  const { data : { user } } = await supabase.auth.getUser();
  const profile_scanned_id = user?.id || null;

  // 🔹 Insère la présence
  const { error } = await supabase
    .from('event_attendees')
    .insert({ 
      event_id: event.id, 
      profile_scanned_id, 
      name, 
      email: email || null 
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 🔁 ✅ Rafraîchit les caches après insertion
  revalidatePath(`/events/${eventId}/check-in`, 'page');
  revalidatePath('/dashboard', 'page'); // ou `/dashboard/events` si spécifique

  return NextResponse.json({ success: true });
}