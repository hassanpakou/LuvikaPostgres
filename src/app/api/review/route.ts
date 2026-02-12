// src/app/api/review/route.ts
import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClientForPage();
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    // 🔹 Validation des données
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 });
    }
    if (comment && comment.length > 500) {
      return NextResponse.json({ error: 'Commentaire trop long (max 500 caractères)' }, { status: 400 });
    }

    // 🔹 Vérifier si l'utilisateur a déjà soumis un avis
    const { data: existingReview } = await (await supabase)
      .from('reviews')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Vous avez déjà soumis un avis' }, { status: 409 });
    }

    // 🔹 Compter les avis de la semaine pour éligibilité badge
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await (await supabase)
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo);

    const isEligibleForBadge = count !== null && count < 100;

    // 🔹 Insérer l'avis
    const { error: insertError } = await (await supabase)
      .from('reviews')
      .insert({
        profile_id: user.id,
        rating,
        comment: comment?.trim() || null,
        platform: 'web',
      });

    if (insertError) {
      console.error('Review insert error:', insertError);
      throw insertError;
    }

    // 🔹 Ajouter le badge si éligible (via fonction RPC sécurisée)
    let badgeAdded = false;
    if (isEligibleForBadge) {
      const { error: badgeError } = await (await supabase)
        .rpc('add_badge_to_profile', {
          profile_id: user.id,
          badge_name: 'pioneer',
        });

      if (badgeError) {
        console.error('Badge update error:', badgeError);
        // Ne pas bloquer la soumission si l'ajout du badge échoue
      } else {
        badgeAdded = true;
      }
    }

    // 🔹 Analytics (optionnel - côté serveur)
    console.log('Review submitted:', { 
      user: user.id, 
      rating, 
      badge: badgeAdded ? 'pioneer' : null 
    });

    return NextResponse.json({ 
      success: true,
      receivedBadge: badgeAdded ? 'pioneer' : null,
      message: badgeAdded 
        ? 'Merci ! Badge "Pionnier LUVIKA" ajouté à votre profil.'
        : 'Merci pour votre avis !'
    });
  } catch (error: any) {
    console.error('Review submission error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la soumission' 
    }, { status: 500 });
  }
}