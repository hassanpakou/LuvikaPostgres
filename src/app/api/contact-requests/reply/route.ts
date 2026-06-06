// src/app/api/contact-requests/reply/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { requestId, message } = await request.json();

    if (!requestId || !message) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('contact_requests')
      .update({
        is_read: true,
        replied_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('profile_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Reply error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}