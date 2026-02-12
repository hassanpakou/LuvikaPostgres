import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClientForPage();
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (userId !== user.id) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 403 });
    }

    // 🔹 Suppression en cascade sécurisée (à implémenter selon ton schéma)
    // ⚠️ ATTENTION : Cette opération est irréversible !
    // Exemple de suppression en cascade :
    // 1. Supprimer les données utilisateur dans toutes les tables liées
    // 2. Supprimer le profil
    // 3. Supprimer l'utilisateur auth.users (nécessite service_role)

    // 🔹 Pour des raisons de sécurité, utilise un Edge Function avec service_role
    // Ici, on retourne une erreur pour forcer l'utilisation d'un Edge Function
    return NextResponse.json({ 
      error: 'Utilisez la fonction Edge sécurisée pour la suppression' 
    }, { status: 403 });

    // 🔹 Alternative sécurisée (recommandé) :
    // Appel à une Edge Function avec service_role key
    // const edgeRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
    //   method: 'POST',
    //   headers: { 
    //     'Authorization': `Bearer ${process.env.SERVICE_ROLE_KEY}`,
    //     'Content-Type': 'application/json' 
    //   },
    //   body: JSON.stringify({ userId: user.id })
    // });
  } catch (error: any) {
    console.error('Deletion error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la suppression' 
    }, { status: 500 });
  }
}