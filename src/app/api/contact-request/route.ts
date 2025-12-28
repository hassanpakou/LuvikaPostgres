// src/app/api/contact-request/route.ts
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ✅ Garde contre build crash
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('⚠️ RESEND_API_KEY manquant — emails désactivés');
}

export async function POST(req: Request) {
  // ✅ Vérifie que Resend est initialisé
  if (!resend) {
    return NextResponse.json(
      { error: 'Service email désactivé (clé manquante)' }, 
      { status: 500 }
    );
  }

  try {
    const { profile_id, name, email, phone, message } = await req.json();

    if (!profile_id || !name || !email || !message) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // ✅ await cookies() — ESSENTIEL
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

    const { data : owner } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', profile_id)
      .single();

    if (!owner?.email) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const { error: mailError } = await resend.emails.send({
      from: 'LUVIKA <onboarding@resend.dev>',
      to: owner.email,
      subject: `📩 Nouveau message de ${name} via votre profil LUVIKA`,
      html: `<p>Test</p>`, // ✅ Simplifié pour le test
    });

    if (mailError) throw mailError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}