// src/app/api/admin/rewards/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  // Utiliser le service role pour bypass RLS
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Récupérer les utilisateurs avec 10000+ scans
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, email, avatar_url, scans_count, plan, badges, created_at')
    .gte('scans_count', 10000)
    .order('scans_count', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data || [] });
}