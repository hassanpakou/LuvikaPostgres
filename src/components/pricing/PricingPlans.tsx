// src/components/pricing/PricingPlans.tsx

'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { 
  Globe, Crown, Building, Zap, CheckCircle, Users, 
  GraduationCap, Palette, Plane, Briefcase, HeartHandshake, 
  ShieldCheck, BarChart3, Star 
} from 'lucide-react';
import Link from 'next/link';

// 🔹 ✅ CORRIGÉ : 'entreprise' au lieu de 'entreprise'
type Plan = {
  key: 'freemium' | 'premium' | 'entreprise'; // ✅ Cohérent avec fr.json
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

  const profiles: Profile[] = [
    { id: 'student', name: 'Étudiant', icon: <GraduationCap className="w-4 h-4" />, price: { usd: 1.5, cdf: 3300, cfa: 900, kwz: 1275 } },
    { id: 'employee', name: 'Employé', icon: <Briefcase className="w-4 h-4" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'artist', name: 'Artiste', icon: <Palette className="w-4 h-4" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'diaspora', name: 'Diaspora', icon: <Plane className="w-4 h-4" />, price: { usd: 2, cdf: 4400, cfa: 1200, kwz: 1700 } },
    { id: 'entrepreneur', name: 'Entrepreneur', icon: <HeartHandshake className="w-4 h-4" />, price: { usd: 3, cdf: 6600, cfa: 1800, kwz: 2550 } },
    { id: 'ngo', name: 'ONG / Assoc.', icon: <Users className="w-4 h-4" />, price: { usd: 4, cdf: 8800, cfa: 2400, kwz: 3400 } },
  ];

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-2 rounded-full border border-cyan-500/20 mb-4">
          <span className="text-cyan-300 font-medium">🌍 LUVIKA</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Une identité culturelle, professionnelle et communautaire. Choisissez votre plan, révélez votre profil.
        </p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
      </motion.div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-white/5 backdrop-blur border border-white/10 rounded-lg p-1">
          {(['usd', 'cdf', 'cfa', 'kwz'] as const).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {plans.map((plan, idx) => {
          const Icon = idx === 0 ? ShieldCheck : idx === 1 ? Crown : Building;
          
          // 🔹 ✅ 'entreprise' ajouté ici
          const colors = {
            freemium: { bg: 'bg-gray-800/30', border: 'border-gray-500/30', text: 'text-gray-300', primary: 'text-gray-400' },
            premium: { bg: 'bg-cyan-900/20', border: 'border-cyan-400/40 ring-1 ring-cyan-400/20', text: 'text-white', primary: 'text-cyan-300' },
            entreprise: { bg: 'bg-purple-900/20', border: 'border-purple-400/40', text: 'text-white', primary: 'text-purple-300' }, // ✅
          };

          // 🔹 ✅ 'entreprise' dans le mapping
          const color = colors[plan.key as keyof typeof colors] || colors.freemium;
          const isHighlighted = plan.key === 'premium';

          return (
            <motion.div
              key={plan.key}
              style={{ y: useTransform(scrollYProgress, [0.2, 0.4], [0, -4]) }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`
                rounded-xl p-5 backdrop-blur-xl border ${color.border}
                ${color.bg} ${isHighlighted ? 'scale-[1.02] z-10' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color.primary}`} />
                  </div>
                  <h3 className={`font-bold ${color.text}`}>{plan.title}</h3>
                </div>
                {plan.badge && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded">
                    {plan.badge}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-400 mb-2">{plan.desc}</p>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-white">
                  {plan.price.mensuel === 0 ? 'Gratuit' : `$${plan.price.mensuel}`}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {plan.price.mensuel === 0 ? 'À vie' : 'par mois'}
                </div>
              </div>

              <Link 
                href={plan.key === 'entreprise' ? "/contact" : "/auth/sign-up"} // ✅ 'entreprise'
                className="block"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full py-2.5 rounded-lg font-medium text-sm transition-all
                    ${plan.key === 'freemium' 
                      ? 'bg-white/5 hover:bg-white/10 border border-gray-600/50 text-gray-300' 
                      : plan.key === 'premium'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20'}
                  `}
                >
                  {ctaChoose[plan.key] || (plan.key === 'freemium' ? 'Commencer gratuitement' : 'Choisir ce plan')}
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 mb-10">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              activeTab === 'profiles'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400'
            }`}
          >
            Profils professionnels
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              activeTab === 'logic'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400'
            }`}
          >
            Logique LUVIKA
          </button>
        </div>

        {activeTab === 'profiles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-3 text-left text-gray-400">Profil</th>
                  <th className="py-2 px-3 text-right text-gray-400">USD</th>
                  <th className="py-2 px-3 text-right text-gray-400">CDF</th>
                  <th className="py-2 px-3 text-right text-gray-400">CFA</th>
                  <th className="py-2 px-3 text-right text-gray-400">KWZ</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {p.icon}
                        <span className="text-gray-300">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-300 font-medium">${p.price.usd}</td>
                    <td className="py-2 px-3 text-right text-gray-300">{p.price.cdf.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-gray-300">{p.price.cfa.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-gray-300">{p.price.kwz.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-500 text-xs mt-3 italic">
              ✨ Tous les profils incluent : biographie avancée, médias illimités, visibilité prioritaire, support prioritaire.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
              <p><span className="font-medium text-gray-300">Basique →</span> Tout le monde peut entrer, gratuitement.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
              <p><span className="font-medium text-cyan-300">Professionnel →</span> On paie selon son profil.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
              <p><span className="font-medium text-purple-300">Entreprise →</span> On paie selon la taille de l’organisation.</p>
            </div>
          </div>
        )}
      </div>

      <motion.div 
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/30 mb-4">
          <Star className="w-4 h-4" />
          <span className="font-medium">Relève qui tu es.</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Choisis ton plan, révèle ton profil.
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Il n’est pas seulement un profil.<br />
          👉 C’est une identité, une histoire et une opportunité.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/auth/sign-up">
            <motion.button
              whileHover={{ scale: 1.03 }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-sm"
            >
              Créer mon profil
            </motion.button>
          </Link>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.03 }}
              className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20"
            >
              Parler à un expert
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}