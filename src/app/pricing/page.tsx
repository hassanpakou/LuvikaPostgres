// src/app/pricing/page.tsx
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function PricingFallback() {
  const locale = await getLocale();
  redirect(`/${locale}/pricing`); // Redirige vers la version localisée
}