// src/app/[locale]/pricing/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PricingPlans from '@/src/components/pricing/PricingPlans';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations('pricing');

  const freemiumTitle = t('plans.freemium.title');
  const premiumTitle = t('plans.premium.title');
  const entrepriseTitle = t('plans.entreprise.title'); // ← "entreprise" avec "s"

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <PricingPlans
          title={t('title')}
          billingMonthly={t('billing.monthly')}
          billingYearly={t('billing.yearly')}
          perMonth={t('billing.per_month')}
          perYear={t('billing.per_year')}
          ctaChoose={{
            freemium: t('cta.choose', { plan: freemiumTitle }),
            premium: t('cta.choose', { plan: premiumTitle }),
            entreprise: t('cta.choose', { plan: entrepriseTitle }), // ← même clé
          }}
          customPlan={t('footer.custom_plan')}
          contactUs={t('footer.contact_us')}
          plans={[
            {
              key: 'freemium' as const,
              title: freemiumTitle,
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
              title: premiumTitle,
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
              price: { mensuel: 12, annuel: 120 },
            },
            {
              key: 'entreprise' as const, // ← "entreprise" + as const
              title: entrepriseTitle,
              desc: t('plans.entreprise.desc'), // ← "entreprise"
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
          ]}
        />
      </div>
    </div>
  );
}