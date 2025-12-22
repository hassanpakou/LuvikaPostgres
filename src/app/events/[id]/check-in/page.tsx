// src/app/events/[id]/check-in/page.tsx
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import CheckInClient from '../../../../components/events/CheckInClient';

export default async function EventCheckInPage({ 
  params 
}: { 
  params: { id: string };
}) {
  const eventId = params.id;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔐 Récupère l'événement côté serveur
const { data: {  event } } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) notFound();

  // 🔐 Récupère la session
const { data: { session } } = await supabase.auth.getSession();
  const isOrganizer = session?.user.id === event.user_id;

  // ✅ Passe uniquement des données sérialisables
  return <CheckInClient eventId={eventId} isOrganizer={isOrganizer} />;
}