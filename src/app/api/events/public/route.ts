import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  if (!profileId) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const now = new Date().toISOString();
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, location, is_public')
    .eq('profile_id', profileId)
    .eq('is_public', true)
    .eq('status', 'active')
    .gte('ends_at', now)
    .order('starts_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events });
}