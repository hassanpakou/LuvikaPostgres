// src/app/api/nfc/activate/route.ts
// Route réservée à l'admin pour activer une carte NFC

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ActivateSchema = z.object({
  card_id: z.string().min(1),
  user_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              req.cookies.set({ name, value, ...options })
            );
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();

    // 🔐 Vérification rôle admin
    if (!session?.user || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ActivateSchema.parse(body);

    // Vérifie que l'utilisateur existe
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', parsed.user_id);

    if (count === 0) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Insère ou met à jour la carte
    const { error } = await supabase
      .from('nfc_cards')
      .upsert({
        card_id: parsed.card_id,
        user_id: parsed.user_id,
        status: 'active',
        activated_at: new Date().toISOString(),
      }, {
        onConflict: 'card_id', // Met à jour si déjà existante
      });

    if (error) throw error;

    // Log dans admin_actions
    await supabase.from('admin_actions').insert({
      admin_id: session.user.id,
      action: 'activate_nfc_card',
      target_user_id: parsed.user_id,
      details: { card_id: parsed.card_id },
    });

    return NextResponse.json({ success: true, message: 'Carte activée' });

  } catch (err: any) {
    console.error('Erreur activation NFC:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}