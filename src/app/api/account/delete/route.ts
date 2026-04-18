import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const cookieStore = cookies();

  // Client standard pour vérifier l'utilisateur et le mot de passe
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
  }

  // Vérifier le mot de passe (sans modifier la session actuelle)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });
  if (signInError) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
  }

  // Client admin pour suppression forcée
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
  }
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Suppression en cascade manuelle
    await supabaseAdmin.from('nfc_cards').delete().eq('user_id', user.id);
    await supabaseAdmin.from('orders').delete().eq('user_id', user.id);
    await supabaseAdmin.from('events').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('event_attendees').delete().eq('profile_scanned_id', user.id);
    await supabaseAdmin.from('scans').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('portfolios').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('certificates').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('contact_requests').delete().eq('profile_id', user.id);
    await supabaseAdmin.from('follows').delete().or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`);
    await supabaseAdmin.from('likes').delete().eq('visitor_id', user.id);
    await supabaseAdmin.from('biometric_credentials').delete().eq('user_id', user.id);

    // Suppression du profil
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (deleteProfileError) throw deleteProfileError;

    // Suppression de l'utilisateur dans auth.users
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true, message: 'Compte supprimé définitivement' });
  } catch (error: any) {
    console.error('Erreur suppression:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}