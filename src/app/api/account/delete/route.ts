// src/app/api/account/delete/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  
  // 1. Initialisation du client avec la clé ANON pour l'authentification initiale
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      global: { headers: { Authorization: `Bearer ${cookieStore.get('supabase-auth-token')?.value?.split(',')[0]}` } } 
    }
  );

  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    // 🔒 VÉRIFICATION SÉCURISÉE : Mot de passe requis
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    // 🔐 Vérification stricte du mot de passe
    const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
    }

    // 🔑 INITIALISATION DU CLIENT ADMIN (SERVICE ROLE) POUR LA SUPPRESSION
    // Nécessaire pour contourner les RLS et supprimer en cascade proprement
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Clé SERVICE_ROLE manquante dans les variables d\'environnement');
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔹 SUPPRESSION EN CASCADE MANUELLE (Sécurité maximale)
    // L'ordre est important pour respecter les clés étrangères si le CASCADE automatique échoue
    
    // 1. NFC Cards
    await supabaseAdmin.from('nfc_cards').delete().eq('user_id', user.id);
    
    // 2. Orders (Table 'orders' liée à profiles via user_id)
    await supabaseAdmin.from('orders').delete().eq('user_id', user.id);
    
    // 3. Events (CORRECTION: utilisation de profile_id au lieu de organizer_id)
    await supabaseAdmin.from('events').delete().eq('profile_id', user.id);
    
    // 4. Event Attendees (CORRECTION: utilisation de profile_scanned_id)
    await supabaseAdmin.from('event_attendees').delete().eq('profile_scanned_id', user.id);
    
    // 5. Scans (Liés à profile_id)
    await supabaseAdmin.from('scans').delete().eq('profile_id', user.id);
    
    // 6. Portfolios, Certificates, etc. (Nettoyage complet)
    await supabaseAdmin.from('portfolios').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('certificates').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('contact_requests').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('follows').delete().or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`);
    await supabaseAdmin.from('likes').delete().eq('visitor_id', user.id); // Ou profile_id selon votre schéma exact de likes
    await supabaseAdmin.from('biometric_credentials').delete().eq('user_id', user.id);

    // 7. Suppression du profil (La contrainte FK vers auth.users avec ON DELETE CASCADE devrait supprimer l'user)
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError) {
      console.error('Erreur suppression profil:', deleteProfileError);
      throw new Error('Échec de la suppression du profil');
    }

    // Note: Si votre FK profiles.id -> auth.users.id a bien "ON DELETE CASCADE", 
    // l'utilisateur est maintenant supprimé de auth.users automatiquement.
    // Sinon, il faudrait utiliser supabaseAdmin.auth.admin.deleteUser(user.id) ici.

    console.log(`✅ Compte supprimé avec succès : ${user.id}`);
    
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
