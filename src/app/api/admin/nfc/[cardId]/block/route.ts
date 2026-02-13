// src/app/api/admin/nfc/[cardId]/block/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ✅ CORRECTION NEXT.JS 15 : params est UNE PROMESSE
export async function POST(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> } // ✅ Type corrigé
) {
  // ✅ OBLIGATOIRE : Attendre la résolution de params
  const { cardId } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔐 Vérification admin (inchangée)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    if (!cardId) {
      return NextResponse.json({ error: 'ID carte manquant' }, { status: 400 });
    }

    // 🔹 Vérifier que la carte existe (inchangé)
    const { data: card, error: cardError } = await supabase
      .from('nfc_cards')
      .select('id, status, user_id, matricule')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
    }

    // 🔹 Bloquer la carte (inchangé)
    const { error: updateError } = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'blocked', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', cardId);

    if (updateError) throw updateError;

    // 🔹 Journaliser l'action (CORRIGÉ : fallback sécurisé)
    await supabase.from('nfc_card_actions').insert({
      card_id: cardId,
      user_id: user.id,
      action_type: 'block' as const,
      matricule_verified: card.matricule || `CARD-${cardId.substring(0, 8)}`, // ✅ Sécurisé
      reason: 'Bloquage manuel par admin',
    });

    console.log(`✅ Carte ${cardId} bloquée par admin ${user.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carte bloquée avec succès' 
    });
  } catch (error: any) {
    console.error('❌ Erreur blocage carte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}