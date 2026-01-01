// src/app/api/events/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 🔹 Sélectionnez seulement les colonnes nécessaires
    const { data: events } = await supabase
      .from('events')
      .select('id, name, location, starts_at, ends_at, qr_code_id')
      .eq('profile_id', user.id)
      .order('starts_at', { ascending: false });

    return NextResponse.json({ events: events || [] });
  } catch (error: any) {
    console.error('❌ GET /api/events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}