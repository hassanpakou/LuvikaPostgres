// src/app/[locale]/public/pricing/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PricingPlans from '../../../../components/pricing/PricingPlans'; // ✅ Chemin corrigé

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'pricing' });
  return {
    title: t('title'),
    description: t('plans.freemium.desc'),
  };
}

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'ln' }];
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations({ locale });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  const plans = [
    {
      key: 'freemium' as const,
      title: t('plans.freemium.title'),
      desc: t('plans.freemium.desc'),
      features: [
        t('plans.freemium.features.nfc'),
        t('plans.freemium.features.users'),
        t('plans.freemium.features.events'),
        t('plans.freemium.features.presence'),
        t('plans.freemium.features.stats'),
        t('plans.freemium.features.roles'),
        t('plans.freemium.features.dashboard'),
      ],
      badge: '',
      price: { mensuel: 0, annuel: 0 },
    },
    {
      key: 'premium' as const,
      title: t('plans.premium.title'),
      desc: t('plans.premium.desc'),
      features: [
        t('plans.premium.features.nfc'),
        t('plans.premium.features.users'),
        t('plans.premium.features.events'),
        t('plans.premium.features.presence'),
        t('plans.premium.features.stats'),
        t('plans.premium.features.roles'),
        t('plans.premium.features.dashboard'),
      ],
      badge: t('plans.premium.popular'),
      highlight: true,
      price: { mensuel: 12, annuel: 120 },
    },
    {
      key: 'entreprise' as const,
      title: t('plans.entreprise.title'),
      desc: t('plans.entreprise.desc'),
      features: [
        t('plans.entreprise.features.nfc'),
        t('plans.entreprise.features.users'),
        t('plans.entreprise.features.events'),
        t('plans.entreprise.features.presence'),
        t('plans.entreprise.features.stats'),
        t('plans.entreprise.features.roles'),
        t('plans.entreprise.features.dashboard'),
      ],
      badge: '',
      price: { mensuel: 39, annuel: 390 },
    },
  ];

  return (
    <>
      <PricingPlans
        title={t('title')}
        billingMonthly={t('billing.monthly')}
        billingYearly={t('billing.yearly')}
        perMonth={t('billing.per_month')}
        perYear={t('billing.per_year')}
        ctaChoose={{
          freemium: t('cta.choose', { plan: t('plans.freemium.title') }),
          premium: t('cta.choose', { plan: t('plans.premium.title') }),
          entreprise: t('cta.choose', { plan: t('plans.entreprise.title') }),
        }}
        customPlan={t('footer.custom_plan')}
        contactUs={t('footer.contact_us')}
        plans={plans}
      />
    </>
  );
}