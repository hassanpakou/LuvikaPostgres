// src/app/(main)/about/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AboutContent from '@/src/components/about/AboutContent';
import Footer from '@/src/components/layout/Footer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations({ locale });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  return (
    <>
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
      <Footer product={''} features={''} pricing={''} download={''} company={''} about={''} contact={''} blog={''} legal={''} privacy={''} terms={''} cookies={''} tagline={''} copyright={''} {...tFooter} />
    </>
  );
}