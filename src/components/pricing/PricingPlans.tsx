// src/components/pricing/PricingPlans.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useMemo } from 'react';
import { 
  Globe, Crown, Building, Zap, CheckCircle, Users, 
  GraduationCap, Palette, Plane, Briefcase, HeartHandshake, 
  ShieldCheck, BarChart3, Star, ChevronRight, Sparkle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Plan = {
  key: 'freemium' | 'premium' | 'entreprise';
  title: string;
  desc: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
  price: { mensuel: number; annuel: number };
};

type Profile = {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: { usd: number; cdf: number; cfa: number; kwz: number };
};

export default function PricingPlans({
  title,
  billingMonthly,
  billingYearly,
  perMonth,
  perYear,
  ctaChoose,
  customPlan,
  contactUs,
  plans,
}: {
  title: string;
  billingMonthly: string;
  billingYearly: string;
  perMonth: string;
  perYear: string;
  ctaChoose: Record<string, string>;
  customPlan: string;
  contactUs: string;
  plans: Plan[];
}) {
  const { scrollYProgress } = useScroll();
  const [currency, setCurrency] = useState<'usd' | 'cdf' | 'cfa' | 'kwz'>('usd');
  const [activeTab, setActiveTab] = useState<'profiles' | 'logic'>('profiles');
  const [isYearly, setIsYearly] = useState(false);

  const profiles: Profile[] = [
    { id: 'student', name: 'Étudiant', icon: <GraduationCap className="w-3.5 h-3.5" />, price: { usd: 1.5, cdf: 3300, cfa: 900, kwz: 1275 } },
    { id: 'employee', name: 'Employé', icon: <Briefcase className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'artist', name: 'Artiste', icon: <Palette className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'diaspora', name: 'Diaspora', icon: <Plane className="w-3.5 h-3.5" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'entrepreneur', name: 'Entrepreneur', icon: <HeartHandshake className="w-3.5 h-3.5" />, price: { usd: 3, cdf: 6600, cfa: 1800, kwz: 2550 } },
    { id: 'ngo', name: 'ONG / Assoc.', icon: <Users className="w-3.5 h-3.5" />, price: { usd: 4, cdf: 8800, cfa: 2400, kwz: 3400 } },
  ];

  // 🔹 Calcul des prix avec réduction annuelle
  const plansWithPricing = useMemo(() => 
    plans.map(plan => ({
      ...plan,
      displayPrice: isYearly 
        ? Math.round(plan.price.annuel / 12 * 100) / 100 
        : plan.price.mensuel,
      originalPrice: isYearly ? plan.price.annuel / 12 : null,
      saving: isYearly ? Math.round((plan.price.mensuel - plan.price.annuel / 12) / plan.price.mensuel * 100) : null
    })), 
  [plans, isYearly]);

  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      {/* 🔹 Hero compact */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 mb-3">
          <Sparkle className="w-3 h-3 text-cyan-300 animate-pulse" />
          <span className="text-cyan-300 font-medium text-xs">🌍 LUVIKA PRICING</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-gray-400 mt-2 text-sm max-w-xl mx-auto">
          Une identité culturelle, professionnelle et communautaire. Choisissez votre plan, révélez votre profil.
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-3 rounded-full"></div>
      </motion.div>

      {/* 🔹 Toggle compact: Mensuel/Annuel + Devise */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-6">
        {/* Toggle Mensuel/Annuel */}
        <div className="inline-flex bg-white/5 backdrop-blur border border-white/10 rounded-lg p-0.5">
          {(['mensuel', 'annuel'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setIsYearly(period === 'annuel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                (period === 'annuel' && isYearly) || (period === 'mensuel' && !isYearly)
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm text-[11px] font-bold'
                  : 'text-gray-400 hover:text-white text-[10px]'
              }`}
            >
              {period === 'mensuel' ? billingMonthly : billingYearly}
            </button>
          ))}
        </div>
        
        {/* Sélecteur devise */}
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
      </div>

      {/* 🔹 Plans compacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plansWithPricing.map((plan, idx) => {
          const Icon = idx === 0 ? ShieldCheck : idx === 1 ? Crown : Building;
          
          const colors = {
            freemium: { bg: 'bg-gray-800/40', border: 'border-gray-500/20', text: 'text-gray-300', primary: 'text-gray-400', gradient: 'from-gray-500/20 to-gray-600/20' },
            premium: { bg: 'bg-cyan-900/25', border: 'border-cyan-400/30 ring-1 ring-cyan-400/15', text: 'text-white', primary: 'text-cyan-300', gradient: 'from-cyan-500/20 to-blue-500/20' },
            entreprise: { bg: 'bg-purple-900/25', border: 'border-purple-400/30', text: 'text-white', primary: 'text-purple-300', gradient: 'from-purple-500/20 to-indigo-500/20' },
          };

          const color = colors[plan.key as keyof typeof colors] || colors.freemium;
          const isHighlighted = plan.key === 'premium';

          return (
            <motion.div
              key={plan.key}
              style={{ y: useTransform(scrollYProgress, [0.2, 0.4], [0, -2]) }}
              whileHover={{ y: -2, scale: 1.005 }}
              className={`
                rounded-xl p-4 backdrop-blur-sm border ${color.border}
                ${color.bg} ${isHighlighted ? 'ring-2 ring-cyan-400/30 scale-[1.01] z-10' : ''}
                transition-all duration-300
              `}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${color.primary}`} />
                  </div>
                  <h3 className={`font-bold text-sm ${color.text}`}>{plan.title}</h3>
                </div>
                {plan.badge && (
                  <Badge className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-[10px] font-bold">
                    {plan.badge}
                  </Badge>
                )}
              </div>
              
              <p className="text-[10px] text-gray-400 mb-2 line-clamp-1">{plan.desc}</p>

              {/* 🔹 Prix compact avec économie */}
              <div className="text-center mb-3">
                <div className="flex items-baseline justify-center gap-1.5">
                  {plan.originalPrice && (
                    <div className="text-[10px] text-gray-500 line-through">
                      ${plan.originalPrice.toFixed(2)}
                    </div>
                  )}
                  <div className="text-xl font-bold text-white">
                    {plan.displayPrice === 0 ? 'Gratuit' : `$${plan.displayPrice.toFixed(2)}`}
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {plan.displayPrice === 0 ? 'À vie' : isYearly ? 'facturé annuellement' : 'par mois'}
                </div>
                {plan.saving && plan.saving > 0 && (
                  <Badge className="mt-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-medium">
                    Économisez {plan.saving}% avec l'annuel
                  </Badge>
                )}
              </div>

              {/* 🔹 Features compacts */}
              <ul className="space-y-1 mb-3.5">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle className="w-2.5 h-2.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 line-clamp-1">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <span>+</span>
                    <span>{plan.features.length - 4} fonctionnalités supplémentaires</span>
                  </li>
                )}
              </ul>

              {/* 🔹 Bouton compact */}
              <Link href={plan.key === 'entreprise' ? "/contact" : "/auth/sign-up"}>
                <Button 
                  size="sm" 
                  className={`
                    w-full font-medium text-[11px] transition-all
                    ${plan.key === 'freemium' 
                      ? 'bg-white/5 hover:bg-white/10 border border-gray-600/50 text-gray-300' 
                      : plan.key === 'premium'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/15 hover:shadow-cyan-500/25'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/15 hover:shadow-purple-500/25'}
                  `}
                >
                  {ctaChoose[plan.key] || (plan.key === 'freemium' ? 'Commencer' : 'Choisir')}
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* 🔹 Section Profils/Logique compacte */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-8">
        <div className="flex gap-2 mb-3">
          {(['profiles', 'logic'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
            >
              {tab === 'profiles' ? 'Profils professionnels' : 'Logique LUVIKA'}
            </button>
          ))}
        </div>

        {activeTab === 'profiles' ? (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-2 text-left text-gray-400 font-medium">Profil</th>
                  <th className="py-2 px-2 text-right text-gray-400 font-medium">USD</th>
                  <th className="py-2 px-2 text-right text-gray-400 font-medium">CDF</th>
                  <th className="py-2 px-2 text-right text-gray-400 font-medium">CFA</th>
                  <th className="py-2 px-2 text-right text-gray-400 font-medium">KWZ</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1.5">
                        {p.icon}
                        <span className="text-gray-300">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-cyan-300">${p.price.usd}</td>
                    <td className="py-1.5 px-2 text-right text-gray-300">{p.price.cdf.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right text-gray-300">{p.price.cfa.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right text-gray-300">{p.price.kwz.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-gray-500 mt-2 italic">
              ✨ Tous les profils incluent : biographie avancée, médias illimités, visibilité prioritaire, support prioritaire.
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-[11px]">
            {[
              { color: 'bg-green-400', text: 'Basique → Tout le monde peut entrer, gratuitement.' },
              { color: 'bg-cyan-400', text: 'Professionnel → On paie selon son profil.' },
              { color: 'bg-purple-400', text: 'Entreprise → On paie selon la taille de l\'organisation.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className={`${item.color} w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0`}></div>
                <p>
                  <span className={`font-medium ${i === 0 ? 'text-gray-300' : i === 1 ? 'text-cyan-300' : 'text-purple-300'}`}>
                    {item.text.split('→')[0]}→
                  </span>
                  {item.text.split('→')[1]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 CTA final compact */}
      <motion.div 
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 mb-3">
          <Star className="w-3 h-3" />
          <span className="font-medium text-[11px]">Relève qui tu es.</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-1.5">
          Choisis ton plan, révèle ton profil.
        </h2>
        <p className="text-gray-400 text-[11px] mb-4">
          Il n'est pas seulement un profil.<br />
          👉 C'est une identité, une histoire et une opportunité.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Link href="/auth/sign-up">
            <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-sm hover:shadow-md">
              Créer mon profil
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
              Parler à un expert
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}