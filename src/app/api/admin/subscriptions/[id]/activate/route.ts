// src/app/api/admin/subscriptions/[id]/activate/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Récupérer l'abonnement
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 });
  }

  // 🔹 Vérifier qu'il n'y a pas déjà un abonnement actif pour le même plan
  const { data: activeDuplicate } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('profile_id', subscription.profile_id)
    .eq('plan', subscription.plan)
    .eq('status', 'active')
    .neq('id', id)
    .maybeSingle();

  if (activeDuplicate) {
    return NextResponse.json({ 
      error: `Un abonnement ${subscription.plan} actif existe déjà pour cet utilisateur.` 
    }, { status: 409 });
  }

  // 🔹 Désactiver tous les autres abonnements actifs (tous plans confondus)
  const { data: otherActiveSubs } = await supabase
    .from('subscriptions')
    .select('id, plan')
    .eq('profile_id', subscription.profile_id)
    .eq('status', 'active')
    .neq('id', id);

  if (otherActiveSubs && otherActiveSubs.length > 0) {
    const otherIds = otherActiveSubs.map(s => s.id);
    
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .in('id', otherIds);
  }

  // Activer cet abonnement
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Échec activation' }, { status: 500 });
  }

  // Mettre à jour le profil
  await supabase
    .from('profiles')
    .update({ 
      plan: subscription.plan,
      updated_at: new Date().toISOString() 
    })
    .eq('id', subscription.profile_id);

  return NextResponse.json({ success: true });
}