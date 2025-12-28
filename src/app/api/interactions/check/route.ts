// src/app/api/interactions/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ hasLiked: false });
  }

  const { profile_id } = await req.json();

  const { data } = await supabase
    .from('profile_interactions')
    .select('id')
    .eq('profile_id', profile_id)
    .eq('visitor_id', session.user.id)
    .eq('type', 'like')
    .maybeSingle();

  return NextResponse.json({ hasLiked: !!data });
}
