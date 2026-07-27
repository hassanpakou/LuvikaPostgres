// src/app/api/admin/inactive-accounts/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Créer un client avec la service_role key pour les opérations admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Vérifier que l'utilisateur connecté est admin
    // On utilise le token de la requête pour vérifier l'auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token avec le client standard
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les utilisateurs (avec service_role key)
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000, // Ajustez selon vos besoins
    });

    if (listError) throw listError;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filtrer les utilisateurs inactifs
    const inactiveUsers = authUsers.users
      .filter(user => {
        const lastSignIn = user.last_sign_in_at 
          ? new Date(user.last_sign_in_at) 
          : new Date(user.created_at);
        return lastSignIn < thirtyDaysAgo;
      })
      .map(user => ({
        id: user.id,
        email: user.email || '',
        last_sign_in_at: user.last_sign_in_at ?? null,
        created_at: user.created_at,
        days_inactive: Math.floor(
          (Date.now() - (user.last_sign_in_at 
            ? new Date(user.last_sign_in_at).getTime() 
            : new Date(user.created_at).getTime())) 
          / (1000 * 60 * 60 * 24)
        ),
      }));

    // Récupérer les profils correspondants
    const userIds = inactiveUsers.map(u => u.id);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, plan')
      .in('id', userIds);

    // Récupérer les avertissements déjà envoyés
    const { data: warnings } = await supabaseAdmin
      .from('inactive_account_warnings')
      .select('user_id, sent_at, scheduled_deletion')
      .in('user_id', userIds);

    const warningMap = new Map(warnings?.map(w => [w.user_id, w]) || []);

    const combined = inactiveUsers.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      const warning = warningMap.get(user.id);
      return {
        ...user,
        full_name: profile?.full_name || null,
        username: profile?.username || null,
        plan: profile?.plan || 'basic',
        warning_sent: !!warning,
        warning_sent_at: warning?.sent_at || null,
        scheduled_deletion: warning?.scheduled_deletion || null,
      };
    });

    return NextResponse.json({ users: combined });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}