// src/app/api/events/[eventId]/participants/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.com').replace(/\/$/, '');

/**
 * Accept either a ReadonlyRequestCookies or a Promise<ReadonlyRequestCookies>.
 * We await the argument inside so callers can pass cookies() (sync or promise) or await cookies().
 */
async function createServerSupabase(cookieStoreOrPromise: ReturnType<typeof cookies> | Promise<ReturnType<typeof cookies>>) {
  const cookieStore = await cookieStoreOrPromise;

  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            // cookieStore.set exists on the Next cookies object
            cookieStore.set({ name, value, ...options })
          );
        },
      },
    }
  );
}

// 🔹 GET : Récupérer tous les participants d'un événement spécifique (utilisé par EventAttendeesSection)
export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  // NOTE: call cookies() WITHOUT await here; createServerSupabase will await if needed
  const cookieStore = cookies();
  const supabase = await createServerSupabase(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (GET participants):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  // Récupérer les participants
  const { data: parts, error } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false }); // Tri par date de création, récent en premier

  if (error) {
    console.error('Erreur Supabase (GET participants):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des participants' }, { status: 500 });
  }

  return NextResponse.json(parts || [], { status: 200 });
}

// 🔹 POST : Ajouter un nouveau participant à un'événement spécifique
export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const payload = await request.json();
  const name = payload?.name;
  const email = payload?.email;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Le nom du participant est requis' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await createServerSupabase(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id, is_public')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (POST participant):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const participantToInsert = {
    event_id: eventId,
    name: name.trim(),
    email: email?.trim() || null,
    qr_token: uuidv4(), // 🔹 Générer un QR token unique
    is_checked_in: false,
    checked_in_at: null,
  };

  // Insérer et récupérer les données insérées (y compris l'id auto-généré)
  const { data: insertedParticipant, error } = await supabase
    .from('event_participants')
    .insert(participantToInsert)
    .select()
    .single();

  if (error) {
    console.error('Erreur Supabase (POST participant):', error);
    if ((error as any)?.code === '23505') {
      return NextResponse.json({ error: 'Erreur interne : conflit de jeton. Veuillez réessayer.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de l\'ajout du participant' }, { status: 500 });
  }

  if (!insertedParticipant || !insertedParticipant.qr_token) {
    console.error('Inserted participant missing or missing qr_token', insertedParticipant);
    return NextResponse.json({ error: 'Impossible de générer le QR' }, { status: 500 });
  }

  // Générer l'URL du QR contenant le token (utilisez APP_URL côté serveur)
  const token = insertedParticipant.qr_token;
  const qrCodeUrl = `${APP_URL}/events/${eventId}?token=${encodeURIComponent(token)}`;

  // Retourner le participant + qr_code_url (utile au frontend pour générer le QR)
  return NextResponse.json({ ...insertedParticipant, qr_code_url: qrCodeUrl }, { status: 201 });
}

// 🔹 PUT : Mettre à jour un participant
export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { participantId, name, email } = await request.json();

  if (!participantId || !name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'ID du participant et nouveau nom requis' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await createServerSupabase(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (PUT participant):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const updates = { name: name.trim(), email: email?.trim() || null };

  const { error } = await supabase
    .from('event_participants')
    .update(updates)
    .eq('id', participantId)
    .eq('event_id', eventId);

  if (error) {
    console.error('Erreur Supabase (PUT participant):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du participant' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Participant mis à jour avec succès' }, { status: 200 });
}

// 🔹 DELETE : Supprimer un participant
export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { participantId } = await request.json();

  if (!participantId) {
    return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await createServerSupabase(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { data: event, error: evError } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (evError) {
    console.error('Erreur récupération event (DELETE participant):', evError);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', participantId)
    .eq('event_id', eventId);

  if (error) {
    console.error('Erreur Supabase (DELETE participant):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression du participant' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Participant supprimé avec succès' }, { status: 200 });
}