// src/app/[locale]/events/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const t = await getTranslations();
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
  const { data: {  event }} = await supabase
    .from('events')
    .select('*, profiles!user_id(*)')
    .eq('id', id)
    .single();

  if (!event) notFound();

  const checkInUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/events/${id}/check-in`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
      <div className="bg-white/10 rounded-xl p-6 text-center mb-6">
        <QRCodeSVG value={checkInUrl} size={200} bgColor="#0f172a" fgColor="#38bdf8" />
        <p className="mt-3 text-gray-300">
          {t('event.qr_instructions')}
        </p>
      </div>
      <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
        <Link href={`${locale}/events/${id}/check-in`}>
          {t('event.check_in_now')}
        </Link>
      </Button>
    </div>
  );
}