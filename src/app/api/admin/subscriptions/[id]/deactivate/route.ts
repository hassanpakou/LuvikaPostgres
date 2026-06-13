// src/app/api/admin/subscriptions/[id]/deactivate/route.ts
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 });
  }

  // ❌ Utiliser 'canceled' au lieu de 'inactive' (conformément à la contrainte CHECK)
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled', // Changé de 'inactive' à 'canceled'
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Erreur désactivation:', updateError);
    return NextResponse.json({ error: 'Échec de la désactivation' }, { status: 500 });
  }

  // Mettre aussi à jour le profil (remettre en basic)
  if (subscription.profile_id) {
    await supabase
      .from('profiles')
      .update({ 
        plan: 'basic',
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscription.profile_id);
  }

  return NextResponse.json({ success: true });
}