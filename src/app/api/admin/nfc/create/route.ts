// src/app/api/admin/nfc/create/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔐 Vérification admin
  const { data : { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { order_id } = await request.json(); // ✅ On reçoit order_id, PAS product_type
    
    // 🔹 Vérifie que la commande existe et est valide
    const { data : order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, product_type')
      .eq('id', order_id)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ 
        error: 'Commande invalide ou déjà traitée' 
      }, { status: 400 });
    }

    // 🔹 Génère un card_id unique (obligatoire car NOT NULL)
    const card_id = `NFC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 🔹 Crée la carte SANS product_type (n'existe pas dans nfc_cards)
    const { data: newCard, error: insertError } = await supabase
      .from('nfc_cards')
      .insert({
        user_id: order.user_id,
        card_id, // ✅ Obligatoire - généré ici
        status: 'inactive',
        order_id: order.id, // ✅ Lie la carte à la commande
        // ⚠️ PAS DE product_type ici - colonne inexistante !
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 🔹 Crée la configuration de carte associée
    await supabase.from('card_configs').insert({
      profile_id: order.user_id,
      scan_type: 'nfc',
      enabled: false,
      custom_url: `/scan/nfc/${newCard.id}`,
    });

    // 🔹 Met à jour le statut de la commande
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id);

    return NextResponse.json({ 
      success: true, 
      card: { 
        ...newCard, 
        user_email: (await supabase
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .single()
        )?.data?.email 
      } 
    });
  } catch (error: any) {
    console.error('Erreur création carte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}