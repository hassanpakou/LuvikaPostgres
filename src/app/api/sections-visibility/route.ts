// src/app/api/profile/sections-visibility/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, sections_visibility } = await req.json();
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data : { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ sections_visibility })
      .eq('id', user_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Sections visibility save error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}