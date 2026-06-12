// src/app/api/subscription/apply-scan-reward/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { profile_id } = await request.json();

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Récupérer les badges actuels
  const { data: profile } = await supabase
    .from('profiles')
    .select('badges')
    .eq('id', profile_id)
    .single();

  const currentBadges = profile?.badges || [];
  
  // Ajouter le badge s'il n'existe pas déjà
  if (!currentBadges.includes('scan_10k_reward')) {
    const newBadges = [...currentBadges, 'scan_10k_reward'];
    
    const { error } = await supabase
      .from('profiles')
      .update({
        badges: newBadges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Récompense 10K scans activée' });
}