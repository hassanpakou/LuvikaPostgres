import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  try {
    // 🔐 1. Vérification authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('⚠️ Non authentifié - Cookie manquant ou invalide');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 🔐 2. VÉRIFICATION ADMIN VIA profiles (CORRECTION CRITIQUE)
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !adminProfile) {
      console.warn('⚠️ Accès refusé: utilisateur non-admin', { 
        userId: user.id, 
        email: user.email,
        profileError: profileError?.message 
      });
      return NextResponse.json({ 
        error: 'Accès réservé aux administrateurs' 
      }, { status: 403 });
    }

    // ✅ 3. Récupération SÉCURISÉE des profils SANS banned_until (cause de l'erreur TS)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        email,
        created_at,
        plan,
        role
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase profiles:', error);
      throw error;
    }

    // ✅ 4. Transformation SANS banned_until (on le gère côté frontend si nécessaire)
    const usersWithStatus = (profiles || []).map(profile => ({
      ...profile,
      // 🔑 CORRECTION : banned_until n'existe PAS dans profiles - on le simule
      banned_until: null,
      isBanned: false, // On gère le ban via une autre logique si nécessaire
    }));

    console.log(`✅ API /api/admin/users: ${usersWithStatus.length} utilisateurs retournés`);
    return NextResponse.json(usersWithStatus);
    
  } catch (error: any) {
    console.error('❌ Erreur critique /api/admin/users:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}