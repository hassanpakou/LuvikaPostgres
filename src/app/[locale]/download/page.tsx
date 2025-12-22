// src/app/[locale]/download/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DownloadContent from '../../../components/download/DownloadContent';

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const t = await getTranslations();

  // ✅ Passe uniquement des strings — aucune fonction
  return (
    <DownloadContent
      title={t('download.title')}
      subtitle={t('download.subtitle')}
      step1_title={t('download.step1.title')}
      step1_desc={t('download.step1.desc')}
      step2_title={t('download.step2.title')}
      step2_desc={t('download.step2.desc')}
      step3_title={t('download.step3.title')}
      step3_desc={t('download.step3.desc')}
      cta_title={t('download.cta_title')}
      cta_desc={t('download.cta_desc')}
      download_now={t('download.download_now')}
    />
  );
}