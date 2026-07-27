// src/app/api/admin/inactive-accounts/delete/route.ts
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur spécifié' }, { status: 400 });
    }

    const results = [];

    for (const userId of userIds) {
      try {
        // Marquer les avertissements comme supprimés
        await supabase
          .from('inactive_account_warnings')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('user_id', userId);

        // Supprimer le profil (cascade vers les autres tables)
        await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        // Supprimer l'utilisateur auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          results.push({ userId, success: false, error: deleteError.message });
        } else {
          results.push({ userId, success: true });
        }

        // Log l'action admin
        await supabase.from('admin_actions').insert({
          admin_id: user.id,
          action: 'delete_inactive_account',
          target_user_id: userId,
          details: { reason: 'inactive_30_days', deleted_at: new Date().toISOString() },
        });
      } catch (error) {
        console.error(`Erreur suppression utilisateur ${userId}:`, error);
        results.push({ userId, success: false, error: 'Erreur serveur' });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}