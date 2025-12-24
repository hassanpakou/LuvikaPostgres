// src/app/api/admin/users/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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

  const sessionRes = await supabase.auth.getSession();
  const session = sessionRes.data.session;

  // 🔐 Vérifie admin via user_metadata
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // 🔍 Recherche utilisateurs
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  // ✅ Construire la requête
  let query = supabase
    .from('profiles')
    .select('id, full_name, username, email, subscriptions!inner(plan)')
    .limit(10);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
  }

  // ✅ Exécuter la requête
  const { data, error } = await query;

  if (error) {
  console.error('Erreur récupération utilisateurs:', error);
  return NextResponse.json([]); // ✅ Tableau vide
}

  // ✅ Typage
  type User = {
    id: string;
    full_name: string;
    username: string;
    email: string;
    subscriptions: { plan: string }[];
  };

  const typedUsers = (data ?? []) as User[];

  return NextResponse.json(
    typedUsers.map(u => ({
      id: u.id,
      full_name: u.full_name,
      username: u.username,
      email: u.email,
      plan: u.subscriptions?.[0]?.plan ?? 'freemium',
    }))
  );
}