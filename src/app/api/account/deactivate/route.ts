import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClientForPage();
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reason, userId } = await request.json();
    
    if (userId !== user.id) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 403 });
    }

    // 🔹 Marquer le compte comme désactivé (ajoute un champ `deactivated_at` dans profiles)
    const { error } = await (await supabase)
      .from('profiles')
      .update({ 
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason || null,
        is_public: false // Masquer le profil
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Compte désactivé temporairement' 
    });
  } catch (error: any) {
    console.error('Deactivation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la désactivation' 
    }, { status: 500 });
  }
}