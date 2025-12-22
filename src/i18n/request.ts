// src/i18n/request.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['fr', 'ln', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
  // 🔹 Récupère la locale depuis l’URL (ex: /fr/, /ln/) ou cookie
  let locale = await requestLocale;

  // Si pas de locale (ex: /), utilise 'fr' par défaut
  if (!locale || !locales.includes(locale as any)) {
    locale = 'fr'; // ou 'ln' si tu préfères
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});