// src/app/api/admin/upgrade-requests/[id]/[action]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 🔹 ✅ CORRECTION : signature élargie
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> } // ← changé ici
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    console.warn('⚠️ Accès refusé à upgrade-requests (non-admin)');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 🔹 ✅ Extraction + validation runtime
  const { id, action } = await context.params;
  if (action !== 'approved' && action !== 'rejected') {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    const { data : upgradeReq, error: fetchError } = await supabase
      .from('upgrade_requests')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !upgradeReq) {
      console.error('❌ Demande introuvable:', id, fetchError?.message);
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    if (upgradeReq.status !== 'pending') {
      return NextResponse.json({ error: 'Statut incompatible' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { status: action };

    try {
      const { data : cols, error } = await supabase
        .rpc('get_columns', { table_name: 'upgrade_requests' });

      if (!error && Array.isArray(cols)) {
        const columnNames = cols.map((c: any) => c.column_name);
        if (columnNames.includes('processed_at')) {
          updatePayload.processed_at = new Date().toISOString();
        }
        if (columnNames.includes('admin_notes')) {
          updatePayload.admin_notes = `Traité par ${user.email} (${action})`;
        }
      }
    } catch (colCheckErr) {
      console.warn('🔍 Échec détection colonnes — fallback basique');
    }

    const { error: updateError } = await supabase
      .from('upgrade_requests')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) throw updateError;

    if (action === 'approved') {
      const { error: planError } = await supabase
        .from('profiles')
        .update({ plan: 'premium' })
        .eq('id', upgradeReq.user_id);

      if (planError) {
        console.error('⚠️ Échec mise à jour profil (plan):', planError.message);
      }
    }

    console.log(`✅ Demande ${id} ${action} par ${user.email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Erreur upgrade-requests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}