// src/app/api/admin/send-welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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

    const sessionRes = await supabase.auth.getSession();
    const session = sessionRes.data.session;

    if (!session?.user || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // ✅ Correction : 'data', pas 'profile'
    const {  data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!data) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const profile = data;

    // 📨 Appelle la Edge Function
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ user_id: profile.id }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Erreur Edge Function:', err);
      return NextResponse.json({ error: err.error || 'Échec envoi email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Erreur API send-welcome:', err);
    return NextResponse.json({ error: err.message || 'Erreur inconnue' }, { status: 500 });
  }
}