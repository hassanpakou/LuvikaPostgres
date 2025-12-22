// src/app/[locale]/page.tsx
// ✅ Page d'accueil animée — Server Component + Client Components

import { HomePageContent } from '../../components/home/HomePageContent';

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Optionnel : validation
  if (!['fr', 'ln', 'en'].includes(locale)) {
    // Redirige vers fr si locale invalide
    return <div>Redirection...</div>; // ou throw new Error()
  }

  return <HomePageContent />;
}