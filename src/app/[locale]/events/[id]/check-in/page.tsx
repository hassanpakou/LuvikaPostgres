// src/app/[locale]/events/[id]/check-in/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import CheckInClient from './CheckInClient';

export default async function CheckInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id: eventId } = await params;
  const { token } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !event) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOrganizer = user?.id === event.profile_id;

  return (
    <CheckInClient
      eventId={event.id}
      eventTitle={event.title}
      startsAt={event.starts_at}
      endsAt={event.ends_at}
      isPublic={event.is_public}
      token={token || null}
      isOrganizer={isOrganizer}
      requiresName={!event.is_public}
    />
  );
}