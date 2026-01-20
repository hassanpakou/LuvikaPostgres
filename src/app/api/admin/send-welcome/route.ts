// src/app/api/admin/send-welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    // 🔐 Vérifie admin
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

    // 📥 Récupère l'email
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // 🔍 Vérifie que l'utilisateur existe
    const { data : profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // ✉️ Envoie l'email via Supabase Auth (invite = email de bienvenue)
    const { error: sendError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { invited_by: session.user.id },
    });

    if (sendError) {
      console.error('❌ Erreur envoi email:', sendError);
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('💥 Erreur API:', err);
    return NextResponse.json({ error: err.message || 'Erreur inconnue' }, { status: 500 });
  }
}