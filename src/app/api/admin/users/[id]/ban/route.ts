// src/app/api/admin/users/[id]/ban/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<{ id: string }>
) {
  const { id: userIdToBan } = await params; // ✅ await params

  const cookieStore = await cookies();
  
  // 🔐 Vérifier admin
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

  const { data : { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const adminId = session.user.id;

  if (userIdToBan === adminId) {
    return NextResponse.json({ error: 'Auto-bannissement interdit' }, { status: 400 });
  }

  // 🔑 Clé service_role obligatoire
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
  }

  try {
    // 🔥 Bannir via API REST
    const banRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userIdToBan}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned_until: 'infinity',
        }),
      }
    );

    if (!banRes.ok) {
      const errorText = await banRes.text();
      console.error('Erreur bannissement:', errorText);
      return NextResponse.json({ error: 'Échec du bannissement' }, { status: 500 });
    }

    // ✅ Désactiver dans profiles
    await supabase
      .from('profiles')
      .update({ verified: false })
      .eq('id', userIdToBan);

    // 📜 Audit
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'ban_user',
        target_user_id: userIdToBan,
        details: { reason: 'Bannissement manuel' },
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Exception bannissement:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}