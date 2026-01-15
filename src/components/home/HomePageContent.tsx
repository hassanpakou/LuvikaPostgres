// src/components/home/HomePageContent.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import ProfileCard3D from '@/components/cards/ProfileCard3D';
import { ArrowRight, Users, ScanLine, ShieldCheck, Nfc, BarChart3, Layers, QrCode } from 'lucide-react';

// 🔑 Fonction déterministe pour le pattern QR
const getQrBlockClass = (index: number): string => {
  // Coins fixes (QR standard)
  const fixedBlack = [0,1,2,6,7,8,12,13,14,30,31,32,36,37,38,42,43,44];
  if (fixedBlack.includes(index)) {
    return 'bg-gray-900';
  }
  
  // Pattern aléatoire MAIS DÉTERMINISTE (même résultat côté serveur et client)
  // Utilise l'index pour générer une "pseudo-random" stable
  const hash = (index * 2654435761) % 49; // nombre premier magique
  return hash > 35 ? 'bg-cyan-400/80' : 'bg-gray-200';
};

export function HomePageContent() {
  const t = useTranslations();
  const locale = useLocale();

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
    {t('download.cta_title')}
  </motion.h2>
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="mt-4 text-gray-300 max-w-2xl mx-auto"
  >
    {t('download.cta_desc')}
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
        {t('download.download_now')}
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
    </motion.button>
  </Link>

  {/* ⚪ Bouton secondaire — sans icône + animations internes */}
  <Link href={`/${locale}/pricing`}>
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
      {t('navbar.pricing')}

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
    text-center
    text-gray-400
    max-w-xl mx-auto
  "
>
  <p className="text-sm sm:text-base leading-relaxed">
    <span className="text-white font-medium">Luvika</span>,  
    c’est la nouvelle façon de se présenter au monde.
    <br />
    Une identité numérique, simple, intelligente et universelle vCard 4.0.
  </p>

  <div className="mt-4 flex justify-center gap-4 text-xs">
    <span className="flex items-center gap-1">
      <Users className="w-4 h-4 text-cyan-400" />
      Créateurs
    </span>
    <span className="flex items-center gap-1">
      <ScanLine className="w-4 h-4 text-blue-400" />
      Entrepreneurs
    </span>
    <span className="flex items-center gap-1">
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
      Professionnels
    </span>
  </div>
</motion.div>

{/* -------------------- Pourquoi LUVIKA ? -------------------- */}
<section id="features" className="relative mt-28 w-full max-w-6xl mx-auto px-4">
  <div className="text-center mb-16">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-5 py-2 rounded-full border border-cyan-500/30"
    >
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
      <span className="text-cyan-300 font-medium text-sm tracking-wide uppercase">
        {t('features.title')}
      </span>
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.8 }}
      className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
    >
      Réinventez votre <span className="text-cyan-400">présence numérique</span>
    </motion.h2>
  </div>

  {/* 🔹 Fond glacial animé */}
  <div className="absolute -z-10 inset-0 overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-cyan-900/20 to-indigo-900/30"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,230,217,0.08),transparent_70%)]"></div>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`glow-${i}`}
        className="absolute rounded-full bg-cyan-500/10 blur-xl"
        style={{
          width: `${30 + i * 10}px`,
          height: `${30 + i * 10}px`,
          left: `${10 + i * 12}%`,
          top: `${20 + i * 8}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      {
        icon: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="currentColor" d="M5.5,8L2,13L4.24,16.13L7.64,15.13L9.24,17.25L6.42,19H18V17H6.42L8.24,15H18V13H8.24L6,10L5.5,8M12,2A3,3 0 0,1 15,5A3,3 0 0,1 12,8A3,3 0 0,1 9,5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5A1,1 0 0,0 12,6A1,1 0 0,0 13,5A1,1 0 0,0 12,4Z" />
            <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
        title: t('features.nfc.title'),
        desc: t('features.nfc.desc'),
        gradient: "from-cyan-500 to-blue-500",
        glow: "shadow-cyan-500/20",
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <path fill="currentColor" d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
            <path fill="currentColor" d="M12,19C9.24,19 7,16.76 7,14H9C9,15.66 10.34,17 12,17C13.66,17 15,15.66 15,14H17C17,16.76 14.76,19 12,19Z" />
          </svg>
        ),
        title: t('features.stats.title'),
        desc: t('features.stats.desc'),
        gradient: "from-blue-500 to-indigo-500",
        glow: "shadow-blue-500/20",
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,10.5C7,11.88 8.12,13 9.5,13S12,11.88 12,10.5S10.88,8 9.5,8S7,9.12 7,10.5M14.5,15C13.12,15 12,16.12 12,17.5S13.12,20 14.5,20S17,18.88 17,17.5S15.88,15 14.5,15M9.5,15C8.12,15 7,16.12 7,17.5S8.12,20 9.5,20S12,18.88 12,17.5S10.88,15 9.5,15M17,10.5C17,11.88 15.88,13 14.5,13S12,11.88 12,10.5S13.12,8 14.5,8S17,9.12 17,10.5Z" />
            <path fill="currentColor" d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
        ),
        title: t('features.multi.title'),
        desc: t('features.multi.desc'),
        gradient: "from-emerald-500 to-teal-500",
        glow: "shadow-emerald-500/20",
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40, rotateX: -15 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: i * 0.15, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.4 }
        }}
        className="group relative"
      >
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
          style={{ 
            background: `linear-gradient(135deg, ${item.gradient.split(' ')[1]}40, ${item.gradient.split(' ')[3]}20)` 
          }}
        ></div>
        
        <div className={`
          relative glass-border rounded-2xl p-7 bg-gradient-to-br from-white/3 to-white/5 
          backdrop-blur-xl border border-white/10 overflow-hidden
          transition-all duration-500
        `}>
          {/* 🔹 Effet de lumière dynamique */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* 🔹 Icône flottante */}
          <motion.div
            className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.glow} shadow-lg`}
            style={{ 
              background: `linear-gradient(135deg, ${item.gradient})` 
            }}
            animate={{ 
              y: [0, -6, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {item.icon}
          </motion.div>

          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {item.desc}
          </p>

          {/* 🔹 Ligne de progression sous-titre */}
          <motion.div
            className="mt-4 h-0.5 bg-white/10 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
          >
            <div className={`h-full ${item.glow}`}></div>
          </motion.div>
        </div>
      </motion.div>
    ))}
  </div>
</section>

{/* -------------------- Événements et QR Codes -------------------- */}
<section id="events" className="relative mt-28 w-full max-w-6xl mx-auto px-4">
  <div className="text-center mb-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="inline-block"
    >
      <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
        {t('features.events.title')}
      </h2>
      <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
    </motion.div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* 🔹 Colonne gauche : visuel QR/NFC */}
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="relative z-10">
        {/* 🔹 QR Code réaliste animé */}
        <motion.div
          className="w-64 h-64 mx-auto relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm"></div>
          
          {/* 🔹 QR Code stylisé — CORRIGÉ */}
          <div className="absolute inset-6 bg-white rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-7 gap-1 w-48 h-48">
              {[...Array(49)].map((_, i) => (
                <div
                  key={i}
                  className={`w-full h-full rounded ${getQrBlockClass(i)}`}
                />
              ))}
            </div>
            <div className="absolute inset-12 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Nfc className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* 🔹 Scanner animé */}
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-12 -translate-x-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent rounded-full"
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* 🔹 Effet de lumière bleue */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </motion.div>

    {/* 🔹 Colonne droite : fonctionnalités */}
    <div>
      <div className="space-y-8">
        {[
          {
            icon: ScanLine,
            title: t('features.events.create.title'),
            desc: t('features.events.create.desc'),
            color: "text-cyan-400",
            bg: "from-cyan-500/10 to-blue-500/10",
          },
          {
            icon: QrCode,
            title: t('features.events.qr.title'),
            desc: t('features.events.qr.desc'),
            color: "text-blue-400",
            bg: "from-blue-500/10 to-indigo-500/10",
          },
          {
            icon: BarChart3,
            title: t('features.events.analytics.title'),
            desc: t('features.events.analytics.desc'),
            color: "text-emerald-400",
            bg: "from-emerald-500/10 to-teal-500/10",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            className="group"
          >
            <div className={`
              glass-border rounded-xl p-6 bg-gradient-to-br ${item.bg}
              backdrop-blur border border-white/10 transition-all duration-300
              hover:border-cyan-400/40
            `}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                  <motion.div
                    className="mt-3 w-10 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* -------------------- Comptes Super Pro / Vente en Ligne -------------------- */}
<section id="enterprise" className="relative mt-28 w-full max-w-5xl mx-auto px-4">
  {/* 🔹 Fond glacial profond */}
  <div className="absolute -z-10 inset-0 overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-cyan-900/30"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,230,217,0.05),transparent_70%)]"></div>
    
    {/* 🔹 Particules flottantes */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
        style={{
          left: `${15 + i * 6}%`,
          top: `${20 + i * 5}%`,
        }}
        animate={{
          y: [0, -10, 0],
          x: [0, Math.sin(i) * 8, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 6 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>

  <div className="relative z-10 text-center py-16">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl mb-8">
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,10.5C7,11.88 8.12,13 9.5,13S12,11.88 12,10.5S10.88,8 9.5,8S7,9.12 7,10.5M14.5,15C13.12,15 12,16.12 12,17.5S13.12,20 14.5,20S17,18.88 17,17.5S15.88,15 14.5,15M9.5,15C8.12,15 7,16.12 7,17.5S8.12,20 9.5,20S12,18.88 12,17.5S10.88,15 9.5,15M17,10.5C17,11.88 15.88,13 14.5,13S12,11.88 12,10.5S13.12,8 14.5,8S17,9.12 17,10.5Z" />
        </svg>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-3xl md:text-5xl font-bold text-white mb-6"
      >
        <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          {t('features.superpro.title')}
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-10"
      >
        {t('features.superpro.desc')}
      </motion.p>

      {/* 🔹 Call-to-action premium */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="inline-block"
      >
        <a
          href={`/${locale}/contact`}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 group"
        >
          <span>{t('navbar.contact')}</span>
          <motion.div
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-white">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </motion.div>
        </a>
      </motion.div>
    </motion.div>
  </div>
</section>

    </div>
  );
}