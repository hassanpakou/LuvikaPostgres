// src/app/api/upgrade-request/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { user_id, profile_id, target_plan } = await req.json();

    if (user.id !== user_id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔹 Récupère les champs nécessaires
    const { data : profile } = await supabase
      .from('profiles')
      .select('plan, full_name, username')
      .eq('id', profile_id)
      .single();

    if (!profile || profile.plan === target_plan) {
      return NextResponse.json({ error: 'Demande invalide' }, { status: 400 });
    }

    // 🔹 Validation du parcours de mise à niveau
    if (profile.plan === 'basic' && target_plan !== 'premium') {
      return NextResponse.json({ error: 'Passage direct à entreprise non autorisé' }, { status: 400 });
    }
    if (profile.plan === 'premium' && target_plan !== 'entreprise') {
      return NextResponse.json({ error: 'Mise à niveau invalide' }, { status: 400 });
    }

    // 🔹 Enregistre la demande
    const { error: insertError } = await supabase
      .from('upgrade_requests')
      .insert({
        user_id,
        profile_id,
        target_plan,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    // 🔹 Si c’est une demande "entreprise", crée l’entreprise immédiatement
    if (target_plan === 'entreprise') {
      const { data : existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user_id)
        .single();

      if (!existingCompany) {
        const firstName = profile.full_name?.split(' ')[0] || 'Entreprise';
        const companyName = `${firstName} Entreprise`;
        const slug = (profile.username || `entreprise-${user_id.substring(0, 8)}`).toLowerCase();

        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            owner_id: user_id,
            name: companyName,
            slug: slug,
            plan: 'entreprise',
          });

        if (companyError) {
          console.error('❌ Échec création entreprise:', companyError);
          // ⚠️ On ne bloque pas la demande, mais on log l’erreur
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Erreur upgrade request:', err);
    return NextResponse.json({ error: err.message || 'Échec de la demande' }, { status: 500 });
  }
}