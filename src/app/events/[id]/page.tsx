// src/app/events/[id]/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import CheckInClient from '../../../components/events/CheckInClient';

export default async function EventCheckInPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const eventId = params.id;
  const token = typeof searchParams.token === 'string' ? searchParams.token : null;

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

  const { data: event } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, is_public')
    .eq('id', eventId)
    .single();

  if (!event) notFound();

  const requiresName = !event.is_public;

  // ✅ Passer toutes les props requises par CheckInClient
  return (
    <CheckInClient
      eventId={eventId}
      eventTitle={event.title}
      startsAt={event.starts_at}
      endsAt={event.ends_at}
      isPublic={event.is_public}
      token={token}
      isOrganizer={false}
      requiresName={requiresName}
    />
  );
}