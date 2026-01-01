import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data :{ user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ✅ Vérifie que l'utilisateur est propriétaire
  const {data :event } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (event?.profile_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data :attendees } = await supabase
    .from('event_attendees')
    .select('name, email, scanned_at')
    .eq('event_id', eventId)
    .order('scanned_at', { ascending: false });

  return NextResponse.json({ attendees });
}