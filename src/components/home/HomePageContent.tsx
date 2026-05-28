// src/components/home/HomePageContent.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Users, ScanLine, ShieldCheck, Nfc, BarChart3,
  Layers, QrCode, Zap, CheckCircle, Star, Trophy, Github,
  Twitter, Linkedin, Heart, Globe, Gavel, Sparkles,
} from 'lucide-react';
import { SiInstagram, SiSocialblade } from 'react-icons/si';
import { Badge } from '@/components/ui/badge';
import ProfileCard3D from '@/components/cards/ProfileCard3D';
import { getQrBlockClass } from '@/src/lib/qr-pattern';

// ============================================================
// 1. CONFIGURATION CENTRALE
// ============================================================
const CONFIG = {
  brand: {
    name: 'LUVIKA',
    taglineKey: 'tagline',
    logo: SiSocialblade,
    gradient: 'from-cyan-400 to-blue-500',
  },
  hero: {
    titleKey: 'LUVIKA',
    audience: [
      { icon: Users, label: 'Créateurs' },
      { icon: ScanLine, label: 'Entrepreneurs' },
      { icon: ShieldCheck, label: 'Professionnels' },
    ],
  },
  cta: {
    titleKey: 'download.cta_title',
    descKey: 'download.cta_desc',
    primaryButton: { textKey: 'download.download_now', link: '/auth/sign-up' },
    secondaryButton: { textKey: 'navbar.pricing', link: '/public/pricing' },
    stats: [
      { value: '50K+', label: 'Utilisateurs', icon: Users },
      { value: '250K+', label: 'Scans', icon: ScanLine },
      { value: '98%', label: 'Satisfaction', icon: Star },
    ],
  },
  features: {
    badgeKey: 'features.title',
    description: 'LUVIKA transforme votre identité numérique avec des fonctionnalités innovantes conçues pour les créateurs, entrepreneurs et professionnels ambitieux.',
    list: [
      {
        icon: Nfc,
        titleKey: 'features.nfc.title',
        descKey: 'features.nfc.desc',
        gradient: 'from-cyan-500 to-blue-500',
        stat: '100% sans contact',
      },
      {
        icon: BarChart3,
        titleKey: 'features.stats.title',
        descKey: 'features.stats.desc',
        gradient: 'from-blue-500 to-indigo-500',
        stat: 'Données en temps réel',
      },
      {
        icon: Layers,
        titleKey: 'features.multi.title',
        descKey: 'features.multi.desc',
        gradient: 'from-emerald-500 to-teal-500',
        stat: 'Multi-plateforme',
      },
    ],
  },
  events: {
    titleKey: 'features.events.title',
    description: 'Organisez, gérez et analysez vos événements avec des QR codes personnalisés et des statistiques en temps réel.',
    features: [
      {
        icon: ScanLine,
        titleKey: 'features.events.create.title',
        descKey: 'features.events.create.desc',
        color: 'text-cyan-400',
        bg: 'from-cyan-500/10 to-blue-500/10',
      },
      {
        icon: QrCode,
        titleKey: 'features.events.qr.title',
        descKey: 'features.events.qr.desc',
        color: 'text-blue-400',
        bg: 'from-blue-500/10 to-indigo-500/10',
      },
      {
        icon: BarChart3,
        titleKey: 'features.events.analytics.title',
        descKey: 'features.events.analytics.desc',
        color: 'text-emerald-400',
        bg: 'from-emerald-500/10 to-teal-500/10',
      },
    ],
  },
  footer: {
    description: 'La nouvelle génération d\'identité numérique pour les créateurs, entrepreneurs et professionnels ambitieux en Afrique et ailleurs.',
    socials: [
      { Icon: Twitter, href: 'https://twitter.com/luvika', color: 'text-cyan-400', hover: 'hover:bg-cyan-500/10' },
      { Icon: SiInstagram, href: 'https://instagram.com/luvika', color: 'text-pink-400', hover: 'hover:bg-pink-500/10' },
      { Icon: Linkedin, href: 'https://linkedin.com/company/luvika', color: 'text-blue-400', hover: 'hover:bg-blue-500/10' },
      { Icon: Github, href: 'https://github.com/luvika', color: 'text-gray-400', hover: 'hover:bg-gray-500/10' },
    ],
    links: [
      { title: 'Produit', icon: Globe, iconColor: 'text-cyan-400', items: ['Fonctionnalités', 'Tarifs', 'Télécharger', 'Documentation'] },
      { title: 'Entreprise', icon: Heart, iconColor: 'text-rose-400', items: ['À propos', 'Contact', 'Blog', 'Carrières'] },
      { title: 'Légal', icon: Gavel, iconColor: 'text-amber-400', items: ['Confidentialité', 'Conditions', 'Cookies', 'Sécurité'] },
    ],
    contactEmail: 'support@luvika.me',
  },
};

// ============================================================
// 2. COMPOSANTS GÉNÉRIQUES
// ============================================================
const GlassCard = ({ children, className = '', hover = true }: any) => (
  <div className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 ${hover ? 'hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10' : ''} ${className}`}>
    {children}
  </div>
);

const GradientBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-1.5 rounded-full border border-cyan-500/30">
    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
    <span className="text-cyan-300 text-xs font-medium tracking-wide uppercase">{children}</span>
  </div>
);

const SectionTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent ${className}`}>
    {children}
  </h2>
);

const AnimatedOnScroll = ({ children, delay = 0, direction = 'up' }: any) => {
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 40 : -40, x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      transition: { 
        duration: 0.6, 
        delay, 
        ease: "easeOut" as const  // ← utilisation de "as const" pour garantir le type littéral
      } 
    },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={variants}>
      {children}
    </motion.div>
  );
};

// ============================================================
// 3. SECTIONS
// ============================================================
const HeroSection = () => {
  const t = useTranslations();
  const { brand, hero } = CONFIG;
  return (
    <section className="relative pt-20 pb-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
            {t(hero.titleKey)}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          {t(brand.taglineKey)}
        </motion.p>

        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {hero.audience.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <item.icon className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-200">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const CTASection = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { cta } = CONFIG;
  return (
    <section className="relative py-16 text-center">
      <GlassCard className="max-w-4xl mx-auto p-8 md:p-12">
        <SectionTitle className="mb-4">{t(cta.titleKey)}</SectionTitle>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">{t(cta.descKey)}</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href={cta.primaryButton.link}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
            >
              {t(cta.primaryButton.textKey)}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </motion.button>
          </Link>
          <Link href={`/${locale}${cta.secondaryButton.link}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-full font-bold text-gray-200 bg-black/40 border border-white/20 hover:bg-white/10 transition"
            >
              {t(cta.secondaryButton.textKey)}
            </motion.button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-12 mt-12 pt-6 border-t border-white/10">
          {cta.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              className="text-center"
            >
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                <stat.icon className="w-4 h-4" />
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
};

const ProfileShowcase = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <section className="relative py-8">
    <div className="relative max-w-md mx-auto">
      {!reducedMotion && <ProfileCard3D />}
      {reducedMotion && (
        <GlassCard className="h-96 flex items-center justify-center text-gray-400">
          Aperçu de la carte
        </GlassCard>
      )}
      <div className="absolute -top-4 -right-4">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold shadow-lg shadow-amber-500/30">
          <Trophy className="w-3 h-3 mr-1 inline" />
          Meilleure solution 2026
        </Badge>
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => {
  const t = useTranslations();
  const { features } = CONFIG;
  return (
    <section className="relative py-20">
      <div className="text-center mb-16">
        <GradientBadge>{t(features.badgeKey)}</GradientBadge>
        <SectionTitle className="mt-4">
          Réinventez votre <span className="text-cyan-400">présence numérique</span>
        </SectionTitle>
        <p className="text-gray-400 max-w-2xl mx-auto mt-4">{features.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.list.map((feature, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.1} direction="up">
            <GlassCard className="p-6 group h-full transition-all hover:-translate-y-2">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `linear-gradient(135deg, ${feature.gradient})` }}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-300 mt-2 text-sm leading-relaxed">{t(feature.descKey)}</p>
              <div className="flex items-center gap-1 mt-4 text-cyan-300 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>{feature.stat}</span>
              </div>
            </GlassCard>
          </AnimatedOnScroll>
        ))}
      </div>
    </section>
  );
};

const EventsSection = () => {
  const t = useTranslations();
  const { events } = CONFIG;
  return (
    <section className="relative py-20">
      <div className="text-center mb-16">
        <GradientBadge>Événements intelligents</GradientBadge>
        <SectionTitle className="mt-4">{t(events.titleKey)}</SectionTitle>
        <p className="text-gray-400 max-w-2xl mx-auto mt-4">{events.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* QR Code moderne */}
        <AnimatedOnScroll direction="left">
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                <div className="bg-white rounded-2xl p-3">
                  <div className="grid grid-cols-7 gap-1 w-64 h-64">
                    {[...Array(49)].map((_, i) => (
                      <div key={i} className={`w-full h-full rounded-sm ${getQrBlockClass(i)}`} />
                    ))}
                  </div>
                  <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Nfc className="w-7 h-7 text-white" />
                  </div>
                </div>
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </AnimatedOnScroll>

        <div className="space-y-5">
          {events.features.map((item, i) => (
            <AnimatedOnScroll key={i} direction="right" delay={i * 0.1}>
              <GlassCard className="p-5 group hover:border-cyan-400/40">
                <div className="flex gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{t(item.descKey)}</p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { footer, brand } = CONFIG;

  return (
    <footer className="relative mt-28 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <brand.logo className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {brand.name}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{footer.description}</p>
            <div className="flex gap-2">
              {footer.socials.map((social, i) => (
                <Link key={i} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg bg-white/5 ${social.hover} transition`}>
                  <social.Icon className={`w-4 h-4 ${social.color}`} />
                </Link>
              ))}
            </div>
          </div>

          {footer.links.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <group.icon className={`w-4 h-4 ${group.iconColor}`} />
                {group.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-cyan-300 transition">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {currentYear} {brand.name}. Fait avec ❤️ en RDC.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Opérationnel</span>
            <a href={`mailto:${footer.contactEmail}`} className="hover:text-cyan-400">{footer.contactEmail}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// 4. COMPOSANT PRINCIPAL
// ============================================================
export function HomePageContent() {
  const prefersReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion ?? false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion ?? false);
  }, [prefersReducedMotion]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/30 to-cyan-950/20 overflow-x-hidden">
      {/* Arrière-plan animé */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10">
        <HeroSection />
        <ProfileShowcase reducedMotion={reduceMotion} />
        <CTASection />
        <FeaturesGrid />
        <EventsSection />
        <Footer />
      </main>
    </div>
  );
}