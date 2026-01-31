// src/app/api/events/[eventId]/participants/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';

// 🔹 GET : Récupérer tous les participants d'un événement spécifique (utilisé par EventAttendeesSection)
export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

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

// 🔹 POST : Ajouter un nouveau participant à un événement spécifique
export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { name, email } = await request.json(); // Attendre name (requis), email (optionnel)

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Le nom du participant est requis' }, { status: 400 });
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

const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id, is_public') // On vérifie aussi is_public
    .eq('id', eventId)
    .single();

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  // Optionnel : N'autoriser l'ajout que pour les événements privés
  // if (event.is_public) {
  //   return NextResponse.json({ error: 'Impossible d\'ajouter des participants à un événement ouvert' }, { status: 400 });
  // }

const participantToInsert = {
    event_id: eventId,
    name: name.trim(),
    email: email?.trim() || null,
    qr_token: uuidv4(), // 🔹 Générer un QR token unique
    is_checked_in: false, // Initialisé à false
    checked_in_at: null,
  };

  // 🔹 Insérer et récupérer les données insérées (y compris l'id auto-généré)
  const { data: insertedParticipant, error } = await supabase
    .from('event_participants')
    .insert(participantToInsert)
    .select() // Sélectionner *après* l'insertion pour récupérer l'id
    .single(); // On s'attend à un seul résultat

  if (error) {
    console.error('Erreur Supabase (POST participant):', error);
    // Vérifier si c'est une contrainte d'unicité sur qr_token (peu probable avec uuidv4, mais bon)
    if (error.code === '23505') { // Violation de contrainte d'unicité
         return NextResponse.json({ error: 'Erreur interne : conflit de jeton. Veuillez réessayer.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de l\'ajout du participant' }, { status: 500 });
  }

  // 🔹 Retourner le participant nouvellement créé (y compris l'id généré)
  return NextResponse.json(insertedParticipant, { status: 201 });
}


// 🔹 PUT : Mettre à jour un participant (changer le nom, email, etc.)
// NOTE : Ne permettez PAS la modification du qr_token ou de is_checked_in via cette route !
export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { participantId, name, email } = await request.json(); // Attendre participantId, name, email

  if (!participantId || !name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'ID du participant et nouveau nom requis' }, { status: 400 });
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const updates = {
    name: name.trim(),
    email: email?.trim() || null,
  };

  const { error } = await supabase
    .from('event_participants')
    .update(updates)
    .eq('id', participantId)
    .eq('event_id', eventId); // S'assurer que le participant appartient bien à l'événement de l'utilisateur

  if (error) {
    console.error('Erreur Supabase (PUT participant):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du participant' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Participant mis à jour avec succès' }, { status: 200 });
}

// 🔹 DELETE : Supprimer un participant
export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { participantId } = await request.json(); // Attendre participantId dans le body

  if (!participantId) {
    return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 });
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id')
    .eq('id', eventId)
    .single();

  if (!event || event.profile_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', participantId)
    .eq('event_id', eventId); // S'assurer que le participant appartient bien à l'événement de l'utilisateur

  if (error) {
    console.error('Erreur Supabase (DELETE participant):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression du participant' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Participant supprimé avec succès' }, { status: 200 });
}