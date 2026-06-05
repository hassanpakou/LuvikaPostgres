// src/components/pricing/PricingPlans.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck, Crown, Building, CheckCircle, ChevronRight,
  GraduationCap, Briefcase, Palette, Plane, HeartHandshake, Users,
  Globe, Zap, BarChart3, Star, Rocket, Award, Sparkles, TrendingUp,
  Clock, Headphones, Database, Share2, Smartphone, FileText, Lock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================
// 1. TYPES & DONNÉES
// ============================================================

type PlanKey = 'freemium' | 'premium' | 'entreprise';

type Plan = {
  key: PlanKey;
  title: string;
  desc: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
  price: { mensuel: number; annuel: number };
};

type Profile = {
  id: string;
  nameKey: string;
  icon: React.ReactNode;
  price: { usd: number; cdf: number; cfa: number; kwz: number };
};

const PLAN_META: Record<PlanKey, {
  icon: React.ElementType;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  badgeBg: string;
}> = {
  freemium: {
    icon: ShieldCheck,
    bgGradient: 'from-gray-800/60 to-gray-900/60',
    borderColor: 'border-gray-700',
    textColor: 'text-gray-200',
    accentColor: 'text-gray-400',
    badgeBg: 'bg-gray-700',
  },
  premium: {
    icon: Crown,
    bgGradient: 'from-cyan-900/40 to-blue-900/40',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-white',
    accentColor: 'text-cyan-300',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  entreprise: {
    icon: Building,
    bgGradient: 'from-purple-900/40 to-indigo-900/40',
    borderColor: 'border-purple-500/50',
    textColor: 'text-white',
    accentColor: 'text-purple-300',
    badgeBg: 'bg-purple-700',
  },
};

const PROFILES: Profile[] = [
  { id: 'student', nameKey: 'profiles.student', icon: <GraduationCap className="w-3.5 h-3.5" />, price: { usd: 1.5, cdf: 3300, cfa: 900, kwz: 1275 } },
  { id: 'employee', nameKey: 'profiles.employee', icon: <Briefcase className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
  { id: 'artist', nameKey: 'profiles.artist', icon: <Palette className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
  { id: 'diaspora', nameKey: 'profiles.diaspora', icon: <Plane className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
  { id: 'entrepreneur', nameKey: 'profiles.entrepreneur', icon: <HeartHandshake className="w-3.5 h-3.5" />, price: { usd: 3, cdf: 6600, cfa: 1800, kwz: 2550 } },
  { id: 'ngo', nameKey: 'profiles.ngo', icon: <Users className="w-3.5 h-3.5" />, price: { usd: 4, cdf: 8800, cfa: 2400, kwz: 3400 } },
];

// ============================================================
// 2. COMPOSANTS RÉUTILISABLES
// ============================================================

const CurrencySelector = ({ currency, setCurrency, t }: any) => (
  <div className="inline-flex bg-white/5 backdrop-blur border border-white/10 rounded-lg p-0.5">
    {(['usd', 'cdf', 'cfa', 'kwz'] as const).map((cur) => (
      <button
        key={cur}
        onClick={() => setCurrency(cur)}
        className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
          currency === cur
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {cur.toUpperCase()}
      </button>
    ))}
  </div>
);

const BillingToggle = ({ isYearly, setIsYearly, billingMonthly, billingYearly }: any) => (
  <div className="inline-flex bg-white/5 backdrop-blur border border-white/10 rounded-lg p-0.5">
    {(['mensuel', 'annuel'] as const).map((period) => (
      <button
        key={period}
        onClick={() => setIsYearly(period === 'annuel')}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
          (period === 'annuel' && isYearly) || (period === 'mensuel' && !isYearly)
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {period === 'mensuel' ? billingMonthly : billingYearly}
      </button>
    ))}
  </div>
);

// ============================================================
// 3. SECTION PROFILS
// ============================================================
const ProfilesSection = ({ currency, isYearly, t }: { currency: string; isYearly: boolean; t: any }) => {
  const formatPrice = (price: number) => {
    if (currency === 'usd') return `$${price.toFixed(2)}`;
    if (currency === 'cdf') return `${price.toLocaleString()} Fc`;
    if (currency === 'cfa') return `${price.toLocaleString()} FCFA`;
    return `${price.toLocaleString()} Kz`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {PROFILES.map((profile) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center transition-all"
        >
          <div className="flex justify-center mb-2 text-cyan-400">{profile.icon}</div>
          <h3 className="text-xs font-semibold text-white">{t(profile.nameKey)}</h3>
          <div className="text-base font-bold text-white mt-1">
            {formatPrice(profile.price[currency as keyof typeof profile.price])}
          </div>
          <div className="text-[10px] text-gray-400">{isYearly ? t('period_per_year') : t('period_per_month')}</div>
          <Link href="/auth/sign-up">
            <Button size="sm" variant="outline" className="mt-2 w-full text-[10px] h-7 border-white/20 bg-white/5 hover:bg-white/10">
              {t('choose_button')}
            </Button>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// 4. SECTION PLANS LOGICIELS
// ============================================================
const SoftwarePlansSection = ({ plans, isYearly, ctaChoose, t }: { plans: Plan[]; isYearly: boolean; ctaChoose: any; t: any }) => {
  const plansWithPricing = useMemo(
    () =>
      plans.map((plan) => {
        const monthlyPrice = plan.price.mensuel;
        const yearlyMonthlyPrice = plan.price.annuel / 12;
        const displayPrice = isYearly ? yearlyMonthlyPrice : monthlyPrice;
        const saving = isYearly
          ? Math.round(((monthlyPrice - yearlyMonthlyPrice) / monthlyPrice) * 100)
          : null;
        return { ...plan, displayPrice, saving, originalPrice: isYearly ? monthlyPrice : null };
      }),
    [plans, isYearly]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plansWithPricing.map((plan, idx) => {
        const meta = PLAN_META[plan.key];
        const Icon = meta.icon;
        const isHighlighted = plan.key === 'premium';
        return (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative rounded-2xl p-6 backdrop-blur-md bg-gradient-to-b ${meta.bgGradient} border ${meta.borderColor} shadow-xl transition-all duration-300 ${isHighlighted ? 'ring-2 ring-cyan-400/50 shadow-cyan-500/20 scale-[1.02] z-10' : ''}`}
          >
            {isHighlighted && (
              <div className="absolute top-0 right-0 z-20 overflow-visible">
                <div className="relative">
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                    <div className="absolute top-2 right-[-28px] rotate-45 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold py-0.5 px-6 shadow-md">
                      {t('recommended_badge')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${meta.accentColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${meta.textColor}`}>{plan.title}</h3>
              </div>
              {plan.badge && (
                <Badge className={`${meta.badgeBg} text-white border-none text-[11px] font-bold px-2 py-0.5`}>{plan.badge}</Badge>
              )}
            </div>

            <p className="text-sm text-gray-300 mb-5">{plan.desc}</p>

            <div className="mb-5 text-center">
              <div className="flex items-baseline justify-center gap-2">
                {plan.originalPrice && <span className="text-gray-400 line-through text-sm">${plan.originalPrice.toFixed(2)}</span>}
                <span className="text-4xl font-black text-white">
                  {plan.displayPrice === 0 ? t('free_label') : `$${plan.displayPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {plan.displayPrice === 0 ? t('free_lifetime') : (isYearly ? t('billed_annually') : t('per_month_no_commitment'))}
              </div>
              {plan.saving && plan.saving > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> {t('save_percent', { percent: plan.saving })}
                </div>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-200">{feature}</span>
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="text-xs text-cyan-400 flex items-center gap-1 pl-6">
                  <span>{t('more_features', { count: plan.features.length - 5 })}</span>
                </li>
              )}
            </ul>

            <Link href={plan.key === 'entreprise' ? '/contact' : '/auth/sign-up'}>
              <Button
                className={`w-full py-5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  plan.key === 'freemium'
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                    : plan.key === 'premium'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-lg shadow-purple-500/25'
                }`}
              >
                {ctaChoose[plan.key] || (plan.key === 'freemium' ? t('cta_start_free') : plan.key === 'premium' ? t('cta_choose_premium') : t('cta_contact_us'))}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <p className="text-[11px] text-gray-500 text-center mt-4">
              {plan.key === 'freemium' ? t('no_card_required') : t('cancel_anytime')}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================
// 5. COMPOSANT PRINCIPAL
// ============================================================
export default function PricingPlans({
  title,
  billingMonthly = 'Mensuel',
  billingYearly = 'Annuel',
  ctaChoose,
  plans,
}: {
  title?: string;
  billingMonthly?: string;
  billingYearly?: string;
  ctaChoose?: Partial<Record<PlanKey, string>>;
  plans: Plan[];
}) {
  const t = useTranslations('pricing_page');
  const [activeTab, setActiveTab] = useState<'profiles' | 'software'>('software');
  const [currency, setCurrency] = useState<'usd' | 'cdf' | 'cfa' | 'kwz'>('usd');
  const [isYearly, setIsYearly] = useState(false);

  const finalTitle = title || t('default_title');
  const finalCtaChoose = {
    freemium: ctaChoose?.freemium || t('cta_freemium'),
    premium: ctaChoose?.premium || t('cta_premium'),
    entreprise: ctaChoose?.entreprise || t('cta_enterprise'),
  };

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto bg-transparent">
      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{finalTitle}</h1>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">{t('subtitle')}</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-4 rounded-full" />
      </motion.div>

      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div className="flex gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-lg p-1 w-fit">
          <button onClick={() => setActiveTab('profiles')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'profiles' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
            {t('tab_profiles')}
          </button>
          <button onClick={() => setActiveTab('software')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'software' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
            {t('tab_software')}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'profiles' && <CurrencySelector currency={currency} setCurrency={setCurrency} t={t} />}
          <BillingToggle isYearly={isYearly} setIsYearly={setIsYearly} billingMonthly={billingMonthly} billingYearly={billingYearly} />
        </div>
      </div>

      {/* Contenu */}
      {activeTab === 'profiles' ? (
        <ProfilesSection currency={currency} isYearly={isYearly} t={t} />
      ) : (
        <SoftwarePlansSection plans={plans} isYearly={isYearly} ctaChoose={finalCtaChoose} t={t} />
      )}

      {/* Note */}
      <div className="mt-12 text-center text-xs text-gray-500 border-t border-white/10 pt-6">
        {t('footer_note')}
      </div>
    </section>
  );
}