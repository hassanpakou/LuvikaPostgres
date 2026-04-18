import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    // Créer un client avec les cookies de la requête
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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reason } = await request.json();

    const { error } = await supabase
      .from('profiles')
      .update({
        deactivated: true,
        deactivation_reason: reason || null,
        deactivated_at: new Date().toISOString(),
        is_public: false,
      })
      .eq('id', user.id);

    if (error) throw error;

    // Déconnexion immédiate
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: 'Compte désactivé' });
  } catch (error: any) {
    console.error('Deactivation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la désactivation' },
      { status: 500 }
    );
  }
}