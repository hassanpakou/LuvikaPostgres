// src/app/api/follow/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    // 🔹 ✅ Sécurité : extraction avec fallback + nettoyage
    let { action, targetId } = body;
    
    // 🔹 Normalisation
    action = typeof action === 'string' ? action.toLowerCase().trim() : '';
    targetId = typeof targetId === 'string' ? targetId.trim() : '';

    console.log('🔍 /api/follow payload parsed:', { action, targetId }); // ✅ Log de debug

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: `Invalid action: "${action}"` }, { status: 400 });
    }
    if (!targetId || targetId.length !== 36) {
      return NextResponse.json({ error: `Invalid targetId: "${targetId}"` }, { status: 400 });
    }
    if (user.id === targetId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    if (action === 'follow') {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_id: targetId });
      
      if (error && error.code !== '23505') throw error; // duplicate OK
    } else {
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: user.id, followed_id: targetId });
      
      if (error) throw error;
    }

    const [
      { count: followers },
      { count: following }
    ] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', targetId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    ]);

    return NextResponse.json({ 
      success: true, 
      isFollowing: action === 'follow',
      followers: followers || 0,
      following: following || 0,
    });
  } catch (error: any) {
    console.error('💥 /api/follow error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}