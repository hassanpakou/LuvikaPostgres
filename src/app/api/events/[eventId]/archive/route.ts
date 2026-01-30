// src/app/api/events/[eventId]/archive/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> } // ✅ eventId, pas id
) {
  const { eventId } = await params; // ✅ déstructure eventId

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

  // Vérifier que l’événement appartient à l’utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId) // ✅ utilise eventId ici
    .single();

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { error } = await supabase
    .from('events')
    .update({ status: 'archived' })
    .eq('id', eventId); // ✅ eventId

  if (error) return NextResponse.json({ error: 'Échec' }, { status: 500 });

  return NextResponse.json({ success: true });
}