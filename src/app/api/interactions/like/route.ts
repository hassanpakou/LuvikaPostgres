// src/app/api/interactions/like/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LikeSchema = z.object({
  profile_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = LikeSchema.parse(body);
    const userId = session.user.id;
    const targetProfileId = parsed.profile_id;

    // 🔐 Vérifie que le profil cible existe
    const profileRes = await supabase
      .from('profiles')
      .select('id, user_id, is_public')
      .eq('id', targetProfileId)
      .single();

    if (profileRes.error || !profileRes.data) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const profile = profileRes.data;
    const isOwner = profile.user_id === userId;
    if (!profile.is_public && !isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔍 Vérifie si le like existe déjà
    const existingRes = await supabase
      .from('profile_interactions')
      .select('id')
      .eq('profile_id', targetProfileId)
      .eq('visitor_id', userId)
      .eq('type', 'like')
      .maybeSingle();

    if (existingRes.data) {
      // 👉 Déjà liké → on supprime
      await supabase
        .from('profile_interactions')
        .delete()
        .eq('id', existingRes.data.id);

      await supabase.rpc('decrement_likes_count', { target_profile_id: targetProfileId });
      return NextResponse.json({ success: true, liked: false });
    } else {
      // 👉 Nouveau like
      await supabase
        .from('profile_interactions')
        .insert({
          profile_id: targetProfileId,
          visitor_id: userId,
          type: 'like',
        });

      await supabase.rpc('increment_likes_count', { target_profile_id: targetProfileId });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (err: any) {
    console.error('Erreur API /like:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}