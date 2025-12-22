// src/app/api/events/check-in/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // ✅ 'await' obligatoire
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; }, // ✅ cookieStore est maintenant un objet
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );


  const { event_id } = await req.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 🔐 Enregistre le scan + présence
  const { error } = await supabase.from('scans').insert({
    profile_id: session?.user.id ?? null,
    scan_type: 'qr_event',
    event_id,
  });

  if (error) {
    console.error('Erreur check-in:', error);
    return NextResponse.json(
      { error: 'Impossible d’enregistrer la présence' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
