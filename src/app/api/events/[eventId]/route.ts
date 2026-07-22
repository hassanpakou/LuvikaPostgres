// src/app/api/events/[eventId]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

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

  // Vérifier propriétaire
  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (DELETE):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Supprimer l'événement (les FK ON DELETE CASCADE devraient nettoyer les participants/attendees)
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Erreur suppression event:', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}