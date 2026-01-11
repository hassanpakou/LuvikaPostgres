// src/app/download/page.tsx
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function DownloadFallback() {
  const locale = await getLocale();
  redirect(`/${locale}/download`);
}