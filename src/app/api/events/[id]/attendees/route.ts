// src/app/api/events/[id]/attendees/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 🔹 ✅ Initialisez Supabase
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

  // 🔹 ✅ Optionnel : vérifiez que l'utilisateur est authentifié ou owner
  const { data : { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data : attendees } = await supabase
      .from('event_attendees')
      .select('name, email, scanned_at')
      .eq('event_id', id)
      // 🔹 🔐 Sécurité : ne renvoyer que si l'utilisateur est le propriétaire de l'événement
      .eq('event_id', id)
      .select(`
        *,
        event: event_id (profile_id)
      `)
      .eq('event.profile_id', user.id)
      .select('name, email, scanned_at');

    // ✅ Ré-extraction propre
    const { data : cleanAttendees } = await supabase
      .from('event_attendees')
      .select('name, email, scanned_at')
      .eq('event_id', id)
      .order('scanned_at', { ascending: false });

    return NextResponse.json({ attendees: cleanAttendees || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}