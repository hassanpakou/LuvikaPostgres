// src/app/api/admin/users/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 🔐 VÉRIFICATION SÉCURISÉE : getUser() + vérification DANS profiles (pas user_metadata)
  const { data : { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log("❌ Non authentifié - user:", user);
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // ✅ CORRECTION CRITIQUE : Vérifie le rôle DANS LA TABLE profiles
  const { data : profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error("❌ Erreur vérification rôle:", profileError);
    return NextResponse.json({ error: 'Erreur vérification rôle' }, { status: 500 });
  }

  if (profile?.role !== 'admin') {
    console.log("❌ Accès refusé - rôle:", profile?.role, "user_id:", user.id);
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // 🔹 Requête SÉCURISÉE : uniquement les utilisateurs (pas les admins)
    let query = supabase
      .from('profiles')
      .select('id, full_name, username, email, plan')
      .eq('role', 'user') // ✅ Exclut les admins de la liste
      .order('created_at', { ascending: false })
      .limit(50);

    // 🔹 Filtre de recherche multi-champs
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    // 🔹 Transformation pour le type User attendu
    const users = (data || []).map((p) => ({
      id: p.id,
      full_name: p.full_name || '',
      username: p.username || '',
      email: p.email || '',
      subscription_plan: (p.plan || 'basic') as 'basic' | 'premium' | 'entreprise',
    }));

    console.log(`✅ ${users.length} utilisateurs chargés pour admin ${user.id}`);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('❌ Erreur API users:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}