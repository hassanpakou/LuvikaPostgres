// src/app/api/cron/cleanup-inactive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Peut être ignoré
          }
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();

    // Trouver les comptes à supprimer (avertis il y a plus de 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: warningsToDelete } = await supabase
      .from('inactive_account_warnings')
      .select('user_id')
      .eq('deleted', false)
      .lt('scheduled_deletion', sevenDaysAgo.toISOString());

    if (!warningsToDelete || warningsToDelete.length === 0) {
      return NextResponse.json({ message: 'Aucun compte à supprimer' });
    }

    const results = [];
    for (const warning of warningsToDelete) {
      try {
        // Supprimer le profil
        await supabase.from('profiles').delete().eq('id', warning.user_id);
        
        // Supprimer l'utilisateur auth
        await supabase.auth.admin.deleteUser(warning.user_id);
        
        // Marquer comme supprimé
        await supabase
          .from('inactive_account_warnings')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('user_id', warning.user_id);

        results.push({ userId: warning.user_id, success: true });
      } catch (error) {
        console.error(`Erreur suppression ${warning.user_id}:`, error);
        results.push({ userId: warning.user_id, success: false });
      }
    }

    return NextResponse.json({ 
      message: `${results.length} compte(s) traité(s)`,
      results 
    });
  } catch (error) {
    console.error('Erreur cron:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}