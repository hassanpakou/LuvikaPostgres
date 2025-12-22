// src/app/api/interactions/check/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CheckSchema = z.object({
  profile_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set({ name, value, ...options }); },
          remove(name, options) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CheckSchema.parse(body);
    const userId = session.user.id;
    const targetProfileId = parsed.profile_id;

    const existingRes = await supabase
      .from('profile_interactions')
      .select('id')
      .eq('profile_id', targetProfileId)
      .eq('visitor_id', userId)
      .eq('type', 'like')
      .maybeSingle();

    return NextResponse.json({ 
      success: true, 
      hasLiked: !!existingRes.data 
    });

  } catch (err: any) {
    console.error('Erreur API /check:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}