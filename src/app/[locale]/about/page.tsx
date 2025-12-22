// src/app/[locale]/about/page.tsx ✅ CORRIGÉ FINAL
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AboutContent from '../../../components/about/AboutContent'; // ← '@/components/...', pas '../../../'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const t = await getTranslations();

  // ✅ Passe les chaînes, PAS t
  return (
    <AboutContent
      title={t('about.title')}
      subtitle={t('about.subtitle')}
      mission_title={t('about.mission.title')}
      mission_content={t('about.mission.content')}
      security={t('about.values.security')}
      security_desc={t('about.values.security_desc')}
      accessibility={t('about.values.accessibility')}
      accessibility_desc={t('about.values.accessibility_desc')}
      african_pride={t('about.values.african_pride')}
      african_pride_desc={t('about.values.african_pride_desc')}
      team_title={t('about.team.title')}
      team_content={t('about.team.content')}
      team_cta={t('about.team.cta')}
    />
  );
}