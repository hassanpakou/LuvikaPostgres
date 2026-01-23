import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

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
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Vérifier que l’événement appartient à l’utilisateur
  const { data: event } = await supabase
    .from('events')
    .select('profile_id, title')
    .eq('id', eventId)
    .single();

  if (!event || event.profile_id !== user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Récupérer tous les participants
  const { data: parts } = await supabase
    .from('event_participants')
    .select('name, email, is_checked_in, checked_in_at, created_at')
    .eq('event_id', eventId);

  if (!parts || parts.length === 0) {
    return new NextResponse('Aucun participant', { status: 200 });
  }

  // Générer le CSV
  const headers = ['Nom', 'Email', 'Présent', 'Heure arrivée', 'Inscrit le'];
  const rows = parts.map(p =>
    [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.email ? `"${p.email.replace(/"/g, '""')}"` : '""',
      p.is_checked_in ? 'Oui' : 'Non',
      p.checked_in_at ? new Date(p.checked_in_at).toLocaleString('fr-FR') : '',
      p.created_at ? new Date(p.created_at).toLocaleString('fr-FR') : ''
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return new NextResponse(blob, {
    headers: {
      'Content-Disposition': `attachment; filename="participants-${event.title?.replace(/\s+/g, '_') || 'event'}_${eventId}.csv"`,
      'Content-Type': 'text/csv',
    },
  });
}