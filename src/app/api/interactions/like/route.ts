// src/app/api/interactions/like/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Client ANON pour la lecture
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

    const { profile_id } = await req.json();

    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
    }

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('likes_count')
      .eq('id', profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // Vérifier si déjà liké (cookie)
    const cookieName = `luvika_like_${profile_id}`;
    const hasLiked = req.cookies.get(cookieName)?.value === 'true';

    let newLikesCount: number;
    let newLiked: boolean;

    if (hasLiked) {
      newLikesCount = Math.max(0, (profile.likes_count || 0) - 1);
      newLiked = false;
    } else {
      newLikesCount = (profile.likes_count || 0) + 1;
      newLiked = true;
    }

    // ✅ Utiliser le SERVICE ROLE pour contourner RLS
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set({ name, value, ...options }); },
          remove(name, options) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    const { error } = await adminClient
      .from('profiles')
      .update({ 
        likes_count: newLikesCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile_id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Échec mise à jour' }, { status: 500 });
    }

    const response = NextResponse.json({
      liked: newLiked,
      likes_count: newLikesCount,
    });

    // Définir le cookie
    if (newLiked) {
      response.cookies.set(cookieName, 'true', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      response.cookies.delete(cookieName);
    }

    return response;
  } catch (err: any) {
    console.error('❌ API Like error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}