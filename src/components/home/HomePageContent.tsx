// src/components/home/HomePageContent.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ProfileCard3D from '@/components/cards/ProfileCard3D';
import { ArrowRight, Users, ScanLine, ShieldCheck, Nfc, BarChart3, Layers } from 'lucide-react';

export function HomePageContent() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300 mb-4"
      >
        {t('LUVIKA')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10"
      >
        {t('tagline')}
      </motion.p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
        className="w-full max-w-md"
      >
        <ProfileCard3D />
        
      </motion.div>
<br /><br />
{/* ✨ Section CTA + Statistiques */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
  className="text-center"
>
  {/* 🔷 Titre et sous-titre */}
  <motion.h2
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
  >
    Prêt à révéler qui tu es ?
  </motion.h2>
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="mt-4 text-gray-300 max-w-2xl mx-auto"
  >
    Rejoins des milliers de professionnels qui transforment leur identité numérique, avec contrôle, sécurité et élégance.
  </motion.p>
</motion.div>

{/* 🎯 Boutons CTA */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
  className="flex flex-col sm:flex-row items-center justify-center gap-4 my-12"
>
  {/* 🔵 Bouton principal — inchangé (parfait) */}
  <Link href="/auth/sign-up">
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="
        group
        relative
        flex
        items-center
        justify-center
        gap-2
        w-full sm:w-auto
        px-8
        py-4
        rounded-full
        font-semibold
        text-lg
        text-white
        bg-gradient-to-r
        from-blue-600
        to-cyan-500
        shadow-lg
        shadow-blue-500/20
        transition-all
        duration-300
      "
    >
      <span className="flex items-center gap-2">
        Commencer gratuitement
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
    </motion.button>
  </Link>

  {/* ⚪ Bouton secondaire — sans icône + animations internes */}
  <Link href="/pricing">
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="
        group
        relative
        flex
        items-center
        justify-center
        w-full sm:w-auto
        px-8
        py-4
        rounded-full
        font-semibold
        text-lg
        text-gray-200
        bg-white/5
        backdrop-blur-xl
        border
        border-white/15
        hover:bg-white/10
        hover:border-cyan-400/30
        transition-all
        duration-300
        overflow-hidden
      "
    >
      Voir les tarifs

      {/* 🌊 Onde concentrique (démarre au centre) */}
      <motion.div
        className="absolute inset-0 rounded-full bg-cyan-400/10 pointer-events-none"
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

      {/* ✨ Lueur centrale pulsante */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-cyan-300/20 pointer-events-none"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 🌙 Gradient intérieur au survol */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  </Link>
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8 }}
  className="
    flex flex-wrap items-center justify-center
    gap-x-6 gap-y-2
    text-sm text-gray-400
  "
>
  <span className="flex items-center gap-2">
    <Users className="w-4 h-4 text-cyan-400" />
    10k+ utilisateurs
  </span>

  <span className="flex items-center gap-2">
    <ScanLine className="w-4 h-4 text-blue-400" />
    50k+ scans
  </span>

  <span className="flex items-center gap-2">
    <ShieldCheck className="w-4 h-4 text-emerald-400" />
    99.9% uptime
  </span>
</motion.div>



<section
  id="features"
  className="relative mt-32 w-full max-w-5xl mx-auto px-4"
>
  {/* Titre */}
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="
      text-center
      text-3xl md:text-4xl
      font-bold
      text-white
      mb-12
    "
  >
    {t('features.title')}
  </motion.h2>

  {/* Grille */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        icon: Nfc,
        title: t('features.nfc.title'),
        desc: t('features.nfc.desc'),
        color: 'text-cyan-400',
      },
      {
        icon: BarChart3,
        title: t('features.stats.title'),
        desc: t('features.stats.desc'),
        color: 'text-blue-400',
      },
      {
        icon: Layers,
        title: t('features.multi.title'),
        desc: t('features.multi.desc'),
        color: 'text-emerald-400',
      },
    ].map((item, i) => {
      const Icon = item.icon;

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -6 }}
          className="
            group
            relative
            glass-border
            rounded-2xl
            p-8
            bg-white/5
            backdrop-blur-xl
            transition-all
            duration-300
            hover:bg-white/10
          "
        >
          {/* Halo */}
          <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent" />

          {/* Icône */}
          <div
            className={`
              mb-5
              inline-flex
              items-center
              justify-center
              w-12 h-12
              rounded-xl
              bg-white/10
              border border-white/15
              ${item.color}
            `}
          >
            <Icon className="w-6 h-6" />
          </div>

          {/* Texte */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {item.title}
          </h3>

          <p className="text-sm leading-relaxed text-gray-300">
            {item.desc}
          </p>
        </motion.div>
      );
    })}
  </div>
</section>

    </div>
  );
}