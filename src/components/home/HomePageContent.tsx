// src/components/home/HomePageContent.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import ProfileCard3D from '../../../components/cards/ProfileCard3D';
import { 
  ArrowRight, Users, ScanLine, ShieldCheck, Nfc, BarChart3, 
  Layers, QrCode, Sparkles, Zap, CheckCircle, Star, // ✅ Correction: Sparkles (avec un 's')
  ChevronRight, Trophy, Briefcase, GraduationCap,
  // Icônes nécessaires pour le Footer
  Github, Twitter, Linkedin, Mail, MapPin, Heart, Globe, User, Gavel, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { SiSocialblade, SiInstagram, SiFacebook, SiSnapchat, SiTelegram, SiWhatsapp, SiTiktok } from 'react-icons/si';

// 🔑 Fonction déterministe pour le pattern QR
const getQrBlockClass = (index: number): string => {
  const fixedBlack = [0,1,2,6,7,8,12,13,14,30,31,32,36,37,38,42,43,44];
  if (fixedBlack.includes(index)) return 'bg-gray-900';
  const hash = (index * 2654435761) % 49;
  return hash > 35 ? 'bg-cyan-400/80' : 'bg-gray-200';
};

export function HomePageContent() {
  const t = useTranslations();
  const locale = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  // 🔹 Détection mobile pour optimiser les animations
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/5 to-indigo-900/10 flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
      {/* 🔹 Fond animé subtil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.1),transparent_70%)]"></div>
        
        {/* Particules flottantes */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 30, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* 🔹 Hero Section - Design Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-5xl mx-auto text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="inline-block mb-6"
        >
          <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 px-4 py-1.5 text-sm font-medium">
            <SiSocialblade className="w-3.5 h-3.5 mr-1.5 inline animate-pulse" />
            Nouvelle génération d'identité numérique
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300 mb-6 tracking-tight"
        >
          {t('LUVIKA')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {t('tagline')}
        </motion.p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[{ icon: Users, label: 'Créateurs' }, { icon: ScanLine, label: 'Entrepreneurs' }, { icon: ShieldCheck, label: 'Professionnels' }].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-cyan-300/90"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 🔹 Profile Card 3D - Centre et Mis en Valeur */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 120, damping: 15 }}
        className="w-full max-w-md mx-auto mb-16 relative"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
        <ProfileCard3D />
        
        {/* 🔹 Badge flottant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute -top-6 -right-6"
        >
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-sm py-1.5 px-4 shadow-lg shadow-amber-500/30">
            <Trophy className="w-4 h-4 mr-1.5 inline" />
            Meilleure solution 2026
          </Badge>
        </motion.div>
      </motion.div>

      {/* 🔹 Section CTA + Statistiques - Design Ultime */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-4xl mx-auto mb-20"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-4"
        >
          {t('download.cta_title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          {t('download.cta_desc')}
        </motion.p>

        {/* 🔹 Boutons CTA optimisés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link href="/auth/sign-up">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="
                group relative flex items-center justify-center gap-2
                w-full sm:w-auto px-8 py-4 rounded-full
                font-bold text-lg text-white
                bg-gradient-to-r from-blue-600 to-cyan-500
                shadow-2xl shadow-blue-500/30
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('download.download_now')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
              
              {/* 🔹 Animation onde au clic */}
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-full bg-white/20"
                />
              </AnimatePresence>
            </motion.button>
          </Link>

          <Link href={`/${locale}/pricing`}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group relative flex items-center justify-center
                w-full sm:w-auto px-8 py-4 rounded-full
                font-bold text-lg text-gray-200
                bg-white/5 backdrop-blur-xl
                border border-white/15
                hover:bg-white/10 hover:border-cyan-400/30
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10">{t('navbar.pricing')}</span>
              
              {/* 🔹 Onde concentrique */}
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
              
              {/* 🔹 Lueur centrale */}
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
              
              {/* 🔹 Gradient intérieur au survol */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </Link>
        </motion.div>

        {/* 🔹 Statistiques sociales */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { value: '50K+', label: 'Utilisateurs', icon: Users },
            { value: '250K+', label: 'Scans', icon: ScanLine },
            { value: '98%', label: 'Satisfaction', icon: Star }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <stat.icon className="w-4 h-4 text-cyan-400" />
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* 🔹 Section Pourquoi LUVIKA ? - Design Premium */}
      <section id="features" className="relative w-full max-w-7xl mx-auto px-4 mb-28">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-5 py-2.5 rounded-full border border-cyan-500/30"
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
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-4"
          >
            Réinventez votre <span className="text-cyan-400">présence numérique</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-400 max-w-3xl mx-auto"
          >
            LUVIKA transforme votre identité numérique avec des fonctionnalités innovantes conçues pour les créateurs, entrepreneurs et professionnels ambitieux.
          </motion.p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Nfc className="w-8 h-8" />,
              title: t('features.nfc.title'),
              desc: t('features.nfc.desc'),
              gradient: "from-cyan-500 to-blue-500",
              glow: "shadow-cyan-500/20",
              stats: "100% sans contact"
            },
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: t('features.stats.title'),
              desc: t('features.stats.desc'),
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/20",
              stats: "Données en temps réel"
            },
            {
              icon: <Layers className="w-8 h-8" />,
              title: t('features.multi.title'),
              desc: t('features.multi.desc'),
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/20",
              stats: "Multi-plateforme"
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
                relative glass-border rounded-2xl p-8 bg-gradient-to-br from-white/3 to-white/5 
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

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {item.desc}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-cyan-300 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{item.stats}</span>
                </div>

                {/* 🔹 Ligne de progression sous-titre */}
                <motion.div
                  className="mt-6 h-0.5 bg-white/10 rounded-full overflow-hidden"
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

      {/* 🔹 Section Événements et QR Codes - Design Ultime */}
      <section id="events" className="relative w-full max-w-7xl mx-auto px-4 mb-28">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="inline-block"
          >
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-4">
              {t('features.events.title')}
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-gray-400 max-w-3xl mx-auto">
              Organisez, gérez et analysez vos événements avec des QR codes personnalisés et des statistiques en temps réel.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                className="w-72 h-72 mx-auto relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-black/40"></div>
                
                {/* 🔹 QR Code stylisé */}
                <div className="absolute inset-6 bg-white rounded-lg flex items-center justify-center p-2">
                  <div className="grid grid-cols-7 gap-1 w-56 h-56">
                    {[...Array(49)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-full h-full rounded ${getQrBlockClass(i)}`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-16 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Nfc className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* 🔹 Scanner animé */}
                <motion.div
                  className="absolute top-0 left-1/2 w-1 h-16 -translate-x-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent rounded-full"
                  animate={{ y: [0, 56, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* 🔹 Badge événement */}
                <div className="absolute -top-4 -right-4">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-sm py-1 px-3 shadow-lg">
                    <Zap className="w-3.5 h-3.5 mr-1 inline" />
                    Événement en direct
                  </Badge>
                </div>
              </motion.div>

              {/* 🔹 Effets de lumière */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
          </motion.div>

          {/* 🔹 Colonne droite : fonctionnalités */}
          <div>
            <div className="space-y-6">
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
                    hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10
                  `}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shadow-lg`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {item.desc}
                        </p>
                        <motion.div
                          className="mt-3 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
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

      {/* 🔹 Section Comptes Super Pro / Vente en Ligne - Design Premium */}
      <section id="enterprise" className="relative w-full max-w-6xl mx-auto px-4 mb-20">
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl mb-8">
              <Briefcase className="w-10 h-10" />
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
              <Link href={`/${locale}/contact`}>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 shadow-2xl shadow-cyan-500/30 transition-all duration-300 group">
                  <span className="flex items-center gap-2">
                    {t('navbar.contact')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>
            
            {/* 🔹 Badges de confiance */}
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {[{ icon: GraduationCap, label: 'Formation incluse' }, { icon: Trophy, label: 'Support prioritaire' }, { icon: Zap, label: 'Mises à jour gratuites' }].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-cyan-200/90"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🔹 Footer CTA - Design Ultime */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <div className="glass-border rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            Prêt à transformer votre identité numérique ?
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Rejoignez des milliers de professionnels qui ont déjà adopté LUVIKA pour se démarquer et connecter avec leur audience.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 shadow-2xl shadow-cyan-500/30">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link href={`/${locale}/pricing`}>
              <Button size="lg" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10 hover:border-cyan-400/30 font-bold text-lg px-8 py-6">
                Voir les tarifs
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-sm text-gray-500"
          >
            <p>🔒 Sécurité de niveau bancaire • 🌍 Disponible dans 9 langues • 📱 Application iOS & Android</p>
          </motion.div>
        </div>
      </motion.div>


     <footer className="w-full mt-20 relative border-t border-white/5">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* 🔸 Brand Section */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <SiSocialblade className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  LUVIKA
                </span>
              </div>
              
              <p className="text-gray-400 leading-relaxed text-sm">
                La nouvelle génération d'identité numérique pour les créateurs, entrepreneurs et professionnels ambitieux en Afrique et ailleurs.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { Icon: Twitter, href: 'https://twitter.com/luvika', color: 'text-cyan-400', hover: 'hover:bg-cyan-500/10' },
                  { Icon: SiInstagram, href: 'https://instagram.com/luvika', color: 'text-pink-400', hover: 'hover:bg-pink-500/10' },
                  { Icon: Linkedin, href: 'https://linkedin.com/company/luvika', color: 'text-blue-400', hover: 'hover:bg-blue-500/10' },
                  { Icon: Github, href: 'https://github.com/luvika', color: 'text-gray-400', hover: 'hover:bg-gray-500/10' },
                ].map(({ Icon, href, color, hover }, i) => (
                  <Link
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-white/5 ${hover} transition-all duration-300 group`}
                  >
                    <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                  </Link>
                ))}
              </div>
            </div>

            {/* 🔸 Links Section (3 colonnes) */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Platform */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Produit
                </h3>
                <ul className="space-y-3">
                  {['Fonctionnalités', 'Tarifs', 'Télécharger', 'Documentation'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500 transition-all" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  Entreprise
                </h3>
                <ul className="space-y-3">
                  {['À propos', 'Contact', 'Blog', 'Carrières'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-rose-300 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500/0 group-hover:bg-rose-500 transition-all" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  Légal
                </h3>
                <ul className="space-y-3">
                  {['Confidentialité', 'Conditions', 'Cookies', 'Sécurité'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-amber-300 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/0 group-hover:bg-amber-500 transition-all" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 🔹 Copyright Bar */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Luvika. Fait avec ❤️ en RDC.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Systèmes opérationnels</span>
              </div>
              <span className="hidden md:inline">•</span>
              <a href="mailto:support@luvika.me" className="hover:text-cyan-400 transition-colors">support@luvika.me</a>
            </div>
          </div>
        </div>
      </footer>
      {/* 🔹 FIN DU FOOTER */}

      
    </div>
  );
}

// 🔹 Styles globaux pour les animations
<style jsx global>{`
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }
  .animate-pulse-slow {
    animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background-size: 200% 100%;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .animate-pulse-slow,
    .animate-shimmer {
      animation: none !important;
    }
  }
`}</style>
