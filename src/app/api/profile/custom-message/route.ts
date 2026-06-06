// src/app/api/profile/custom-message/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ✅ Export nommé (pas default)
export async function POST(req: Request) {
  try {
    const { user_id, message } = await req.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id,
        message,
        type: 'custom',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Custom message error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}