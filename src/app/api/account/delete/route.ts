// src/app/api/account/delete/route.ts
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    // 🔒 VÉRIFICATION SÉCURISÉE : Mot de passe requis dans le body
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    // 🔐 Vérification du mot de passe
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
    }

    // 🔹 SUPPRESSION SÉCURISÉE EN CASCADE (sans Edge Function)
    // 1. Supprimer les cartes NFC associées
    await supabase
      .from('nfc_cards')
      .delete()
      .eq('user_id', user.id);

    // 2. Supprimer les commandes
    await supabase
      .from('orders')
      .delete()
      .eq('user_id', user.id);

    // 3. Supprimer les événements et participants
    await supabase
      .from('events')
      .delete()
      .eq('organizer_id', user.id);

    await supabase
      .from('event_attendees')
      .delete()
      .eq('profile_id', user.id);

    // 4. Supprimer les scans
    await supabase
      .from('scans')
      .delete()
      .eq('profile_id', user.id);

    // 5. Supprimer le profil (déclenche la suppression en cascade de auth.users)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('Erreur suppression profil:', deleteError);
      return NextResponse.json({ 
        error: 'Échec de la suppression - Contactez le support' 
      }, { status: 500 });
    }

    // 6. Déconnexion immédiate
    await supabase.auth.signOut();

    console.log(`✅ Compte supprimé : ${user.id}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Compte supprimé définitivement' 
    });
  } catch (error: any) {
    console.error('❌ Erreur critique suppression compte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur - Contactez le support' 
    }, { status: 500 });
  }
}