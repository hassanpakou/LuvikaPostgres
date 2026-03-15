// src/app/api/account/deactivate/route.ts
import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClientForPage(); // Assurez-vous d'attendre la promesse si c'est une fonction async
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reason, userId } = await request.json();
    
    if (userId !== user.id) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 403 });
    }

    // 🔹 CORRECTION : Utiliser uniquement les colonnes existantes
    // On masque le profil (is_public = false) et on pourrait stocker la raison dans un champ temporaire 
    // ou simplement la logger côté serveur si nécessaire.
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_public: false, // Masquer le profil immédiatement
        // Optionnel : Si vous avez ajouté les colonnes via SQL, décommentez les lignes ci-dessous :
        // deactivated_at: new Date().toISOString(),
        // deactivation_reason: reason || null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }

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
