// src/app/[locale]/page.tsx
// ✅ Page d'accueil animée — Server Component + Client Components

import { HomePageContent } from '@/src/components/home/HomePageContent';
import { createNotifier } from '@/src/lib/notify';
import error from 'next/error';

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Optionnel : validation
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) {
    return <div>Redirection...</div>;
  }

  return <HomePageContent />;
}