// src/app/api/orders/[id]/cancel/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔹 1. ATTENDRE les params — obligatoire Next.js 15+
  const { id } = await params;
  console.log('🆔 Order ID to cancel:', id);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔹 2. Utiliser getUser() — plus sécurisé
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.warn('❌ Auth failed:', userError?.message || 'No user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 🔹 Récupérer la commande
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    if (order.user_id !== user.id) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Statut incompatible' }, { status: 400 });

    // 🔹 Mettre à jour
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    console.log('✅ Order cancelled successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Cancel API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}