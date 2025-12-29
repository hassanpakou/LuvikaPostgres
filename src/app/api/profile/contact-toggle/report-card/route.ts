// src/app/api/profile/report-card/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, reason, profile_id } = await req.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data : { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // ✅ Met à jour le statut de la carte
    const { error } = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'lost',
        lost_reason: reason,
        lost_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('status', 'active');

    if (error) throw error;

    // 🔔 Optionnel : envoie un email à l'admin
    // await sendAdminAlert('Carte signalée', ...);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Report card error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}