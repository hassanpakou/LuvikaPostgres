// src/app/api/search-users/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  
  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔹 Recherche par username ou full_name — case-insensitive
  const { data, error } = await supabase
  .from('profiles')
  .select('id, username, full_name, plan, avatar_url')
  .ilike('username', `%${query}%`)
  .or(`full_name.ilike.%${query}%`)
  .eq('is_public', true)
  .limit(8);

if (error) {
  console.error('Erreur recherche:', error);
  return NextResponse.json({ users: [] });
}

const users = data || []; // ✅ jamais null

  // 🔹 Récupère qui est suivi par l'utilisateur courant
  const { data : { user } } = await supabase.auth.getUser();
  const followingIds: string[] = [];

  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', user.id);
    
    follows?.forEach(f => followingIds.push(f.followed_id));
  }

  return NextResponse.json({ 
    users: users.map(u => ({ 
      ...u, 
      isFollowing: followingIds.includes(u.id),
    })) 
  });
}