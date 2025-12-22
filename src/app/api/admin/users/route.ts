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
  const { data: { session } } = await supabase.auth.getSession();

  // 🔐 Vérifie admin
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  // 🔍 Recherche utilisateurs
  const query = supabase
    .from('profiles')
    .select('id, full_name, username, email, subscriptions!inner(plan)')
    .limit(10);

  if (search) {
    query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
  }

// ✅ Correct — data est un tableau
type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscriptions: { plan: string }[];
};

const { data, error } = await query;

if (error) {
  console.error('Erreur récupération utilisateurs:', error);
  return NextResponse.json(
    { error: 'Erreur lors du chargement des utilisateurs' },
    { status: 500 }
  );
}

const typedUsers = (data ?? []) as User[];

return NextResponse.json(
  typedUsers.map(u => ({
    id: u.id,
    full_name: u.full_name,
    username: u.username,
    email: u.email,
    plan: u.subscriptions?.[0]?.plan ?? 'freemium',
  }))
);}
