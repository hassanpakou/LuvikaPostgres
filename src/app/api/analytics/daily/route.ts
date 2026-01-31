// src/app/api/analytics/daily/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

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
        },
      }
    );

    // ✅ AUTH SÉCURISÉE
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // ✅ CONTRÔLE D’ACCÈS
    if (user.id !== profile_id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔹 Récupère les scans
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const { data, error } = await supabase.rpc('get_daily_scans', {
      p_profile_id: profile_id,
      p_days: days,
    });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('❌ Erreur analytics:', err);
    return NextResponse.json({ error: 'Échec du chargement' }, { status: 500 });
  }
}
