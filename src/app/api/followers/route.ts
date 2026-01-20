// src/app/api/following/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
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
    return NextResponse.json({ following: [] });
  }

  const { data : { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.plan === 'basic') {
    return NextResponse.json({ following: [] });
  }

  const { data : following } = await supabase
    .from('follows')
    .select(`
      followed_id,
      followed:profiles!followed_id (full_name, username)
    `)
    .eq('follower_id', profileId);

  return NextResponse.json({ following: following || [] });
}