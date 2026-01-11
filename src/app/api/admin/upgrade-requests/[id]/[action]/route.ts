// src/app/api/admin/upgrade-requests/[id]/[action]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
  // ✅ Service role pour contourner RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { id, action } = await context.params;

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    // Récupère la demande
    const { data : req } = await supabase
      .from('upgrade_requests')
      .select('profile_id, target_plan, status')
      .eq('id', id)
      .single();

    if (!req || req.status !== 'pending') {
      return NextResponse.json({ error: 'Demande invalide' }, { status: 400 });
    }

    const { profile_id, target_plan } = req;

    // Met à jour la demande
    await supabase
      .from('upgrade_requests')
      .update({ 
        status: action,
        processed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (action === 'approved') {
      // 1. Annule tous les abonnements actifs
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('profile_id', profile_id)
        .eq('status', 'active');

      // 2. Crée le nouvel abonnement
      await supabase
        .from('subscriptions')
        .insert({
          profile_id,
          plan: target_plan,
          status: 'active',
          provider: 'manual'
        });

      // 3. Met à jour le profil
      await supabase
        .from('profiles')
        .update({ plan: target_plan })
        .eq('id', profile_id);

      // 4. Crée l'entreprise si nécessaire
      if (target_plan === 'entreprise') {
        const { data : company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', profile_id)
          .single();

        if (!company) {
          const slug = `entreprise-${profile_id.substring(0, 8)}`;
          await supabase
            .from('companies')
            .insert({
              owner_id: profile_id,
              name: 'Mon Entreprise',
              slug: slug,
              plan: 'entreprise'
            });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}