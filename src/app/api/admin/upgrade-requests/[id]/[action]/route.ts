// src/app/api/admin/upgrade-requests/[id]/[action]/route.ts
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

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, action } = await context.params;

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    const { data : upgradeReq } = await supabase
      .from('upgrade_requests')
      .select('id, profile_id, status')
      .eq('id', id)
      .single();

    if (!upgradeReq || upgradeReq.status !== 'pending') {
      return NextResponse.json({ error: 'Demande introuvable ou déjà traitée' }, { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from('upgrade_requests')
      .update({
        status: action,
        processed_at: new Date().toISOString(),
        admin_notes: `Traité par ${user.email} — ${action === 'approved' ? 'Approuvé' : 'Rejeté'}`,
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    if (action === 'approved') {
      // 🔹 ✅ Paramètre CORRECT : profile_uuid
      const { error: rpcError } = await supabase
        .rpc('admin_set_premium_plan', { 
          profile_uuid: upgradeReq.profile_id  // ✅ nom exact du paramètre
        });

      if (rpcError) {
        console.error('❌ Échec admin_set_premium_plan:', rpcError);
        throw rpcError;
      }

      console.log(`✅ Profil ${upgradeReq.profile_id} mis à jour en Premium`);
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