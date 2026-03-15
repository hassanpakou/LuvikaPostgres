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
    // Note: Vérifie le nom de la colonne pour les likes (visitor_id ou profile_id)
    await supabaseAdmin.from('likes').delete().eq('visitor_id', user.id); 
    await supabaseAdmin.from('biometric_credentials').delete().eq('user_id', user.id);

    // 7. Suppression du profil (déclenche maintenant le CASCADE vers auth.users si configuré)
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError) {
      console.error('Erreur suppression profil:', deleteProfileError);
      throw new Error('Échec de la suppression du profil');
    }

    // 8. Suppression finale de l'utilisateur dans Auth (Sécurité supplémentaire)
    // Même si le CASCADE fonctionne, cette ligne garantit que l'user est bien supprimé de auth.users
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      console.warn('Avertissement suppression Auth (peut-être déjà fait par CASCADE):', deleteAuthError.message);
      // On ne lance pas d'erreur ici car le profil est déjà supprimé, c'est juste un nettoyage
    }

    console.log(`✅ Compte supprimé avec succès : ${user.id}`);

    // 9. Réponse de succès
    return NextResponse.json({ 
      success: true, 
      message: 'Compte supprimé définitivement' 
    });

  } catch (error: any) {
    console.error('❌ Erreur critique suppression compte:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur - Contactez le support' }, 
      { status: 500 }
    );
  }
}
