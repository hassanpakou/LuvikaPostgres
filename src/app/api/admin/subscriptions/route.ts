// src/app/api/admin/subscriptions/[id]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { plan, status, expires_at } = body;

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

  // Vérifier l'authentification et le rôle admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Récupérer l'abonnement existant
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 });
  }

  // Construire l'objet de mise à jour
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (plan !== undefined) {
    // Vérifier que le plan est valide
    if (!['basic', 'premium', 'entreprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }
    updateData.plan = plan;
  }

  if (status !== undefined) {
    // Vérifier que le statut est valide
    if (!['active', 'canceled', 'expired', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    updateData.status = status;
  }

  // Gérer expires_at explicitement
  if (expires_at !== undefined) {
    // Si null ou chaîne vide → à vie
    if (expires_at === null || expires_at === '') {
      updateData.expires_at = null;
    } else {
      // Valider que c'est une date valide
      const date = new Date(expires_at);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Date d\'expiration invalide' }, { status: 400 });
      }
      updateData.expires_at = date.toISOString();
    }
  }

  // Mettre à jour l'abonnement
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .select('*, profiles!left(id, full_name, username, email)')
    .single();

  if (updateError) {
    console.error('Erreur mise à jour abonnement:', updateError);
    return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
  }

  // Synchroniser le plan avec la table profiles si le statut est actif
  if (updateData.status === 'active' || (updateData.plan && subscription.status === 'active')) {
    const planToUpdate = updateData.plan || subscription.plan;
    await supabase
      .from('profiles')
      .update({ 
        plan: planToUpdate,
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscription.profile_id);
  }

  // Si on désactive, remettre en basic
  if (updateData.status === 'canceled') {
    await supabase
      .from('profiles')
      .update({ 
        plan: 'basic',
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscription.profile_id);
  }

  return NextResponse.json(updatedSubscription);
}