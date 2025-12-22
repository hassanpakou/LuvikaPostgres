// src/app/contact/page.tsx
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function ContactFallback() {
  const locale = await getLocale(); // Ex: 'fr', 'ln', 'en'
  redirect(`/${locale}/contact`);
}