// src/components/pricing/PricingPlans.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CreditCard, Crown, Building, Zap } from 'lucide-react';
import Link from 'next/link';

type Plan = {
  key: 'freemium' | 'premium' | 'enterprise';
  title: string;
  desc: string;
  features: string[];
  badge: string;
  price: { mensuel: number; annuel: number };
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
  ctaChoose: Record<'freemium' | 'premium' | 'enterprise', string>;
  customPlan: string;
  contactUs: string;
  plans: Plan[];
}) {
  const { scrollYProgress } = useScroll();
  const [isYearly, setIsYearly] = useState(false);
  const billing = isYearly ? 'annuel' : 'mensuel';

  return (
    <section className="py-8 px-4 max-w-4xl mx-auto -mt-4">
      {/* Titre compact */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
      >
        {title}
      </motion.h2>

      <p className="text-gray-400 text-center text-sm md:text-base mb-8">
        Commencez gratuitement — aucune carte bancaire requise.
      </p>

      {/* Toggle compact */}
      <div className="flex justify-center items-center mb-8">
        <span className="text-gray-400 text-sm mr-3">{billingMonthly}</span>
        <div 
          className="relative w-14 h-7 rounded-full bg-white/5 cursor-pointer border border-white/10"
          onClick={() => setIsYearly(!isYearly)}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-cyan-400 shadow-md"
            animate={{ 
              x: isYearly ? 28 : 3,
              backgroundColor: isYearly ? '#06b6d4' : '#38bdf8',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
            {isYearly ? '✓' : ''}
          </span>
        </div>
        <div className="ml-3 flex items-center gap-1">
          <span className="text-gray-400 text-sm">{billingYearly}</span>
          <span className="text-cyan-400 text-xs font-bold">-25%</span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, idx) => {
          const Icon = idx === 0 ? CreditCard : idx === 1 ? Crown : Building;
          const color = idx === 0 ? 'cyan' : idx === 1 ? 'amber' : 'emerald';
          const isPopular = plan.key === 'premium';

          return (
            <motion.div
              key={plan.key}
              style={{
                rotateY: useTransform(scrollYProgress, [0.3, 0.6], [idx * -2, idx * 2]),
                y: useTransform(scrollYProgress, [0.3, 0.6], [0, -8]),
              }}
              whileHover={{ 
                scale: 1.02, 
                y: -4,
                boxShadow: `0 20px 40px -10px rgba(6, 182, 212, ${idx === 0 ? '0.25' : idx === 1 ? '0.3' : '0.2'})`,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className={`
                relative rounded-xl p-6
                glass-border backdrop-blur
                border-white/15
                overflow-hidden
                ${isPopular ? 'ring-1 ring-cyan-400/30' : ''}
              `}
            >
              {/* Glow interne au hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-gradient-to-br from-cyan-400/5 to-transparent" />
                <div className="absolute -top-1 -right-1 w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl animate-pulse" />
              </div>

              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon & Titre */}
              <div className="text-center mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                <p className="text-gray-400 text-sm">{plan.desc}</p>
              </div>

              {/* Prix */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white">
                  {billing === 'annuel' && plan.key !== 'freemium'
                    ? `$${(plan.price.annuel / 12).toFixed(0)}`
                    : `$${plan.price[billing]}`
                  }
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {billing === 'annuel' && plan.key !== 'freemium'
                    ? perMonth
                    : billing === 'mensuel' ? perMonth : perYear}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <Zap className={`w-3 h-3 mt-0.5 flex-shrink-0 text-${color}-400`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA — Bouton glacial */}
              <Link href="/auth/sign-up" className="block group">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    relative w-full py-3 rounded-lg font-semibold text-white text-sm
                    bg-white/5 border border-white/15
                    hover:border-${color}-300/40
                    transition-all duration-300
                    overflow-hidden
                  `}
                >
                  {/* Onde concentrique */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-cyan-400/10 pointer-events-none"
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0.5, 0, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 1,
                      ease: 'easeOut',
                    }}
                  />
                  {/* Lueur centrale */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-cyan-300/30 pointer-events-none"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {ctaChoose[plan.key]}
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <p className="text-gray-500 text-sm">
          ✨ {customPlan}{' '}
          <Link href="/contact" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
            {contactUs}
          </Link>
        </p>
      </motion.div>
    </section>
  );
}