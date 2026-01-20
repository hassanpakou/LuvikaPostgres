// src/app/api/follow/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
  if (!session?.user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  }

  const { action, targetId } = await request.json();

  if (!targetId || !['follow', 'unfollow'].includes(action)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  try {
    if (action === 'follow') {
      await supabase
        .from('follows')
        .insert({ follower_id: session.user.id, followed_id: targetId });
    } else {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('followed_id', targetId);
    }

    // 🔁 Retourne les nouveaux compteurs
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', targetId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', session.user.id),
    ]);

    return NextResponse.json({ success: true, followers: followers ?? 0, following: following ?? 0 });
  } catch (err) {
    console.error('Erreur follow:', err);
    return NextResponse.json({ error: 'Échec de l’action' }, { status: 500 });
  }
}