// src/app/api/followers/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profile_id = searchParams.get('profile_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!profile_id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

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

  const { data : { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ followers: [], total: 0 });
  }

  const { data : { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.plan === 'basic') {
    return NextResponse.json({ followers: [], total: 0 });
  }

  // Compter le total des followers
  const { count: total } = await supabase
    .from('follows')
    .select('*', { count: 'exact' })
    .eq('followed_id', profile_id);

  // Récupérer les followers avec pagination
  const { data : followers } = await supabase
    .from('follows')
    .select(`
      follower_id,
      created_at,
      follower:profiles!follower_id (full_name, username, avatar_url, plan)
    `)
    .eq('followed_id', profile_id)
    .range((page - 1) * limit, page * limit - 1);

  return NextResponse.json({ 
    followers: followers || [], 
    total: total || 0,
    page,
    limit
  });
}
