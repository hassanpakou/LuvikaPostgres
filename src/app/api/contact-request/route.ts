// src/app/api/contact-request/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { profile_id, name, email, phone, message } = await request.json();

  // ✅ Validation basique
  if (!profile_id || !name || !email || !message) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

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

  try {
    // 🔹 ✅ Insère dans contact_requests (pas d’email)
    const { error } = await supabase
      .from('contact_requests')
      .insert({
        profile_id,
        name,
        email,
        phone: phone || null,
        message,
        is_read: false,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Contact request error:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}