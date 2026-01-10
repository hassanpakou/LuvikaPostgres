// src/app/api/upgrade-request/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 🔹 Types explicites
type Plan = 'basic' | 'premium' | 'entreprise';

const planOrder: Record<Plan, number> = {
  basic: 0,
  premium: 1,
  entreprise: 2,
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const user_id = body.user_id as string;
    const profile_id = body.profile_id as string;
    const target_plan = body.target_plan as Plan;

    if (user.id !== user_id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, full_name, username')
      .eq('id', profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 });
    }

    const currentPlan = profile.plan as Plan;
    if (currentPlan === target_plan) {
      return NextResponse.json({ error: 'Vous avez déjà ce plan' }, { status: 400 });
    }

    // 🔹 Validation du parcours
    if (planOrder[target_plan] <= planOrder[currentPlan]) {
      return NextResponse.json({ error: 'Mise à niveau invalide' }, { status: 400 });
    }

    // 🔹 Enregistre la demande SANS créer l'entreprise
    const { error: insertError } = await supabase
      .from('upgrade_requests')
      .insert({
        user_id,
        profile_id,
        target_plan,
        status: 'pending' as const,
        requested_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ Erreur insertion upgrade_requests:', insertError);
      return NextResponse.json({ error: 'Échec de la demande' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Erreur upgrade request:', err);
    return NextResponse.json({ error: err.message || 'Échec de la demande' }, { status: 500 });
  }
}