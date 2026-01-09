// src/app/api/analytics/daily/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const profile_id = request.nextUrl.searchParams.get('profile_id');
    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          // ⚠️ set/remove ne sont PAS nécessaires en lecture seule
        },
      }
    );

    // 🔹 Vérifie session
    const { data : { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 🔹 Vérifie accès au profil
    const { data : profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profile_id)
      .single();

    if (!profile || profile.id !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔹 Récupère les scans
    const days = request.nextUrl.searchParams.get('days') || '30';
    const { data, error } = await supabase.rpc('get_daily_scans', {
      p_profile_id: profile_id,
      p_days: parseInt(days, 10)
    });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('❌ Erreur analytics:', err);
    return NextResponse.json({ error: 'Échec du chargement' }, { status: 500 });
  }
}