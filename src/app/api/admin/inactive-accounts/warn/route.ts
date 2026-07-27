// src/app/api/admin/inactive-accounts/warn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Client admin avec service_role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Vérifier le token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
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

    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur spécifié' }, { status: 400 });
    }

    const results = [];
    const scheduledDeletion = new Date();
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 7);

    for (const userId of userIds) {
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userError || !userData?.user) {
          results.push({ userId, success: false, error: 'Utilisateur non trouvé' });
          continue;
        }

        const userEmail = userData.user.email;
        
        const { data: existingWarning } = await supabaseAdmin
          .from('inactive_account_warnings')
          .select('id')
          .eq('user_id', userId)
          .eq('deleted', false)
          .single();

        if (existingWarning) {
          results.push({ userId, success: false, error: 'Avertissement déjà envoyé' });
          continue;
        }

        await supabaseAdmin
          .from('inactive_account_warnings')
          .insert({
            user_id: userId,
            scheduled_deletion: scheduledDeletion.toISOString(),
            email_sent: true,
          });

        // Envoyer l'email avec Resend (si configuré)
        if (userEmail && process.env.RESEND_API_KEY) {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          await resend.emails.send({
            from: 'Luvika <noreply@luvika.io>',
            to: userEmail,
            subject: 'Votre compte sera bientôt supprimé - Luvika',
            html: `<h2>Votre compte sera bientôt supprimé</h2><p>Connectez-vous avant le ${scheduledDeletion.toLocaleDateString('fr-FR')} pour éviter la suppression.</p>`,
          });
        }

        results.push({ userId, success: true, email: userEmail });
      } catch (error) {
        console.error(`Erreur pour l'utilisateur ${userId}:`, error);
        results.push({ userId, success: false, error: 'Erreur serveur' });
      }
    }

    return NextResponse.json({ results, scheduledDeletion });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}