// src/app/[locale]/pricing/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PricingPlans from '@/src/components/pricing/PricingPlans';

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

export default async function PricingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  if (!['fr', 'en', 'ln'].includes(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pricing' });

  const translations = {
    title: t('title'),
    billing: {
      monthly: t('billing.monthly'),
      yearly: t('billing.yearly'),
      per_month: t('billing.per_month'),
      per_year: t('billing.per_year'),
    },
    cta: {
      choose_freemium: t('cta.choose', { plan: t('plans.freemium.title') }),
      choose_premium: t('cta.choose', { plan: t('plans.premium.title') }),
      choose_entreprise: t('cta.choose', { plan: t('plans.entreprise.title') }),
    },
    footer: {
      custom_plan: t('footer.custom_plan'),
      contact_us: t('footer.contact_us'),
    },
    plans: {
      freemium: {
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
      },
      premium: {
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
        popular: t('plans.premium.popular'),
      },
      entreprise: {
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
      },
    },
  };

const plans = [
  {
    key: 'freemium' as const,
    title: translations.plans.freemium.title,
    desc: translations.plans.freemium.desc,
    features: translations.plans.freemium.features,
    badge: '',
    price: { mensuel: 0, annuel: 0 },
  },
  {
    key: 'premium' as const,
    title: translations.plans.premium.title,
    desc: translations.plans.premium.desc,
    features: translations.plans.premium.features,
    badge: translations.plans.premium.popular,
    highlight: true,
    price: { mensuel: 12, annuel: 120 },
  },
  {
    key: 'entreprise' as const,  // ← CORRIGÉ ICI
    title: translations.plans.entreprise.title,
    desc: translations.plans.entreprise.desc,
    features: translations.plans.entreprise.features,
    badge: '',
    price: { mensuel: 39, annuel: 390 },
  },
];

  return (
    <PricingPlans
      title={translations.title}
      billingMonthly={translations.billing.monthly}
      billingYearly={translations.billing.yearly}
      perMonth={translations.billing.per_month}
      perYear={translations.billing.per_year}
      ctaChoose={{
        freemium: translations.cta.choose_freemium,
        premium: translations.cta.choose_premium,
        entreprise: translations.cta.choose_entreprise,
      }}
      customPlan={translations.footer.custom_plan}
      contactUs={translations.footer.contact_us}
      plans={plans}
    />
  );
}