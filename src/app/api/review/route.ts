// src/app/api/review/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper pour créer le client Supabase dans les routes API
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const supabase = await createClient();

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profile_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération avis:', error);
      return NextResponse.json({ reviews: [] });
    }

    console.log('Reviews trouvés:', reviews?.length);

    return NextResponse.json({ reviews: reviews || [] });
  } catch (err) {
    console.error('Erreur API reviews:', err);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        profile_id: user.id,
        rating,
        comment: comment?.trim() || null,
        platform: 'web',
      });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, message: 'Merci pour votre avis !' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}