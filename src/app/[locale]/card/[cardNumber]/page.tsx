// src/app/[locale]/card/[cardNumber]/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import OrgCardPublicClient from '@/src/components/org/OrgCardPublicClient';

export const dynamic = 'force-dynamic';

export default async function OrgCardPublicPage({
  params,
}: {
  params: Promise<{ locale: string; cardNumber: string }>;
}) {
  const { locale, cardNumber } = await params;

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

  // Récupérer la carte
  const { data: orgCard, error } = await supabase
    .from('org_cards')
    .select(`
      *,
      profiles:member_id(full_name, avatar_url, job_title, email, phone, username),
      companies:org_id(name, logo_url, description, website)
    `)
    .eq('card_number', cardNumber)
    .single();

  if (error || !orgCard) {
    notFound();
  }

  // Vérifier si la carte est valide
  const isExpired = orgCard.valid_until && new Date(orgCard.valid_until) < new Date();
  const isValid = orgCard.status === 'active' && !isExpired;

  // Enregistrer le scan
  if (isValid) {
    await supabase.from('scans').insert({
      profile_id: orgCard.member_id,
      scan_type: 'nfc',
      created_at: new Date().toISOString(),
    });
  }

  return (
    <OrgCardPublicClient
      card={orgCard}
      isValid={isValid}
      isExpired={isExpired}
      locale={locale}
    />
  );
}