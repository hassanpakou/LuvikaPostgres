import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, action } = await context.params;

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    // 🔹 Étape 1 : Charger la demande
    const { data: upgradeReq } = await supabase
      .from('upgrade_requests')
      .select('id, status, profile_id, target_plan')
      .eq('id', id)
      .single();

    if (!upgradeReq || upgradeReq.status !== 'pending') {
      return NextResponse.json({ error: 'Demande introuvable ou déjà traitée' }, { status: 400 });
    }

    // 🔹 Étape 2 : Charger le profil séparément
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, plan, full_name, username')
      .eq('id', upgradeReq.profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil utilisateur introuvable' }, { status: 400 });
    }

    const { profile_id, target_plan } = upgradeReq;

    // 🔹 Étape 3 : Récupérer les notes
    let admin_notes = `Traité par ${user.email} — ${action === 'approved' ? 'Approuvé' : 'Rejeté'}`;
    try {
      const body = await request.json();
      if (body?.admin_notes) admin_notes = body.admin_notes;
    } catch (e) { /* ignore */ }

    // 🔹 Étape 4 : Mettre à jour la demande
    const { error: updateErr } = await supabase
      .from('upgrade_requests')
      .update({
        status: action,
        processed_at: new Date().toISOString(),
        admin_notes,
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // 🔹 Étape 5 : Traitement si approuvé
    if (action === 'approved') {
      // a. Utiliser la fonction RPC sécurisée
      const { error: rpcError } = await supabase
        .rpc('admin_set_premium_plan', { profile_uuid: profile_id });

      if (rpcError) {
        console.error('❌ Échec RPC:', rpcError);
        throw rpcError;
      }

      // b. Créer l'entreprise si nécessaire
      if (target_plan === 'entreprise') {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', profile_id)
          .single();

        if (!existingCompany) {
          const firstName = profile.full_name?.split(' ')[0] || 'Entreprise';
          const companyName = `${firstName} Entreprise`;
          let slug = (profile.username || `entreprise-${profile_id.substring(0, 8)}`).toLowerCase();
          
          // Génère un slug unique
          let counter = 1;
          while (true) {
            const { data: exists } = await supabase
              .from('companies')
              .select('id')
              .eq('slug', slug)
              .single();
            
            if (!exists) break;
            slug = `${slug}-${counter}`;
            counter++;
          }

          const { error: companyErr } = await supabase
            .from('companies')
            .insert({
              owner_id: profile_id,
              name: companyName,
              slug: slug,
              plan: 'entreprise',
            });

          if (companyErr) console.error('❌ Échec création entreprise:', companyErr);
        }
      }
    }

    console.log(`✅ Demande ${id} ${action} par ${user.email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Erreur upgrade-requests:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}