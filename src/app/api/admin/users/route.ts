// src/app/api/admin/users/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // 🔹 Récupère les profils
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // 🔹 Récupère les données d'auth avec SERVICE_ROLE_KEY
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => null } }
  );

  const { data: authUsers, error: authError } = await supabaseAdmin
    .from('auth.users')
    .select('id, banned_until');

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // 🔹 Combine les données (sécurisé)
  const usersWithBanStatus = (profiles || []).map(profile => {
    const authUser = (authUsers || []).find(u => u.id === profile.id);
    return {
      ...profile,
      banned_until: authUser?.banned_until || null,
    };
  });

  return NextResponse.json(usersWithBanStatus);
}