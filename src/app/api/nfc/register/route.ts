// src/app/api/nfc/register/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { user_id, username } = await req.json();

  // 🔒 Vérifie que c'est bien son compte
  if (user.id !== user_id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // ✅ Insère la carte (le matricule est généré automatiquement)
  const { error } = await supabase
    .from('nfc_cards')
    .insert({
      user_id,
      card_id: crypto.randomUUID(),
      status: 'active',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Erreur enregistrement NFC:', error);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}