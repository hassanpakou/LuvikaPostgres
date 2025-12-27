import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PricingPlans from '../../../components/pricing/PricingPlans';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const t = await getTranslations('pricing');

  const freemiumTitle = t('plans.freemium.title');
  const premiumTitle = t('plans.premium.title');
  const enterpriseTitle = t('plans.enterprise.title');

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
            enterprise: t('cta.choose', { plan: enterpriseTitle }),
          }}
          customPlan={t('footer.custom_plan')}
          contactUs={t('footer.contact_us')}
          plans={[  // ✅ CHANGÉ : 'plan' → 'plans' (avec 's')
            {
              key: 'freemium',
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
              key: 'premium',
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
              key: 'enterprise',
              title: enterpriseTitle,
              desc: t('plans.enterprise.desc'),
              features: [
                t('plans.enterprise.features.nfc'),
                t('plans.enterprise.features.users'),
                t('plans.enterprise.features.events'),
                t('plans.enterprise.features.presence'),
                t('plans.enterprise.features.stats'),
                t('plans.enterprise.features.roles'),
                t('plans.enterprise.features.dashboard'),
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