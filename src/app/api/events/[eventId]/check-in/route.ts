// src/app/api/events/[eventId]/check-in/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) { // ✅ 'eventId'
  const { eventId } = await params; // ✅ Extraire 'eventId'
  const { token, name } = await request.json();

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token invalide ou manquant' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        },
      },
    }
  );

  // 🔐 TRANSACTION SUPABASE pour garantir l'atomicité
  const { data, error } = await supabase.rpc('check_in_participant', { // Appel d'une fonction RPC ou d'une procédure stockée
    p_event_id: eventId,
    p_token: token,
    p_name: name // Le nom est passé ici
  });

  if (error) {
    console.error("Erreur de check-in:", error);
    // Gérer les différents codes d'erreur de la fonction RPC
    if (error.code === 'EVENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Événement introuvable ou privé' }, { status: 404 });
    } else if (error.code === 'TOKEN_NOT_FOUND') {
      return NextResponse.json({ error: 'QR code non reconnu' }, { status: 404 });
    } else if (error.code === 'ALREADY_CHECKED_IN') {
      return NextResponse.json({ error: 'Déjà scanné' }, { status: 409 });
    } else if (error.code === 'NAME_MISMATCH') { // Nouveau cas d'erreur
      return NextResponse.json({ error: 'Nom incorrect pour ce QR' }, { status: 403 });
    } else if (error.code === 'EVENT_FULL') {
      return NextResponse.json({ error: 'Événement complet' }, { status: 409 });
    } else if (error.code === 'EVENT_NOT_ACTIVE_YET') {
      return NextResponse.json({ error: 'Événement pas encore actif' }, { status: 400 });
    } else if (error.code === 'EVENT_ENDED') {
      return NextResponse.json({ error: 'Événement terminé' }, { status: 400 });
    }
    // Erreur générique
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }

  // Si succès, renvoyer les infos du participant
  return NextResponse.json({ success: true, name: data.name, checked_in_at: data.checked_in_at });
}