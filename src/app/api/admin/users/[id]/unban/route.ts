// src/app/api/admin/users/[id]/unban/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  // 🔐 Vérifier admin
  const { data : { user } } = await supabase.auth.getUser(); // ✅ CORRECTION ICI
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const adminId = user.id;
  const userIdToUnban = (await params).id;

  if (!userIdToUnban || userIdToUnban === adminId) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY manquante');
      return NextResponse.json({ error: 'Erreur config' }, { status: 500 });
    }

    // 🔓 Débannir via API REST
    const unbanRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userIdToUnban}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned_until: null, // 👈 Réinitialise le bannissement
        }),
      }
    );

    if (!unbanRes.ok) throw new Error(await unbanRes.text());

    // ✅ Réactiver dans profiles
    await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('id', userIdToUnban);

    // 📜 Audit
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'unban_user',
        target_user_id: userIdToUnban,
        details: { reason: 'Débannissement manuel' },
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur débannissement:', err);
    return NextResponse.json({ error: 'Échec du débannissement' }, { status: 500 });
  }
}