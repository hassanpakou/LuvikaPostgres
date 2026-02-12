// src/components/layout/PublicProfileFooter.tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Twitter, Linkedin, Mail, MapPin, 
  Heart, Globe, User, Sparkles, ChevronUp, Gavel 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SiFacebook, SiInstagram, SiSnapchat, SiSocialblade, SiTelegram, SiTiktok, SiWhatsapp } from 'react-icons/si';

export default function PublicProfileFooter() {
  const t = useTranslations('footer');
  
  // Scroll to top functionality
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // 🔹 Liens internationalisés
  const platformLinks = [
    { label: t('features'), href: '/#features' },
    { label: t('pricing'), href: '/pricing' },
    { label: t('download'), href: '/download' },
    { label: t('documentation'), href: '/documentation' },
  ];

  const resourcesLinks = [
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('blog'), href: '/blog' },
  ];

  const legalLinks = [
    { label: t('privacy'), href: '/privacy' },
    { label: t('terms'), href: '/terms' },
    { label: t('cookies'), href: '/cookies' },
  ];

  // 🔹 Réseaux sociaux officiels LUVIKA
  const officialSocials = [
    { Icon: Twitter, href: 'https://twitter.com/luvika', label: 'Twitter', color: 'text-cyan-400', hover: 'hover:bg-cyan-500/10' },
    { Icon: SiInstagram, href: 'https://instagram.com/luvika', label: 'Instagram', color: 'text-pink-400', hover: 'hover:bg-pink-500/10' },
    { Icon: Linkedin, href: 'https://linkedin.com/company/luvika', label: 'LinkedIn', color: 'text-blue-400', hover: 'hover:bg-blue-500/10' },
    { Icon: Github, href: 'https://github.com/luvika', label: 'GitHub', color: 'text-gray-400', hover: 'hover:bg-gray-500/10' },
  ];

  return (
    <footer className="w-full mt-auto relative">
      {/* 🔹 Bouton "Retour en haut" */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 border border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('scroll_to_top')}
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 🔸 Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <SiSocialblade className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  LUVIKA
                </span>
              </div>
            
            <p className="text-gray-400 leading-relaxed max-w-md">
              {t('tagline')}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              {officialSocials.map(({ Icon, href, label, color, hover }) => (
                <Link 
                  key={label}
                  href={href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-white/5 ${hover} transition-all duration-300 group`}
                  aria-label={label}
                >
                  <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* 🔸 Links Section - 3 colonnes (Platform, Company, Legal) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Platform */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                {t('product')}
              </h3>
              <ul className="space-y-2">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company */}
              <div className="space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                {t('company')}
              </h3>
              <ul className="space-y-2">
                {resourcesLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-rose-500/0 group-hover:bg-rose-500 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal - NOUVELLE COLONNE */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                {t('legal')}
              </h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-500/0 group-hover:bg-amber-500 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 🔸 CTA Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-cyan-500/10 rounded-lg">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{t('cta_title')}</h3>
                  <p className="text-gray-300 mt-2 text-sm">
                    {t('cta_description')}
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                  >
                    {t('cta_button')} →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{t('available_languages')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {['fr', 'en', 'sw', 'ln', 'pt', 'ar', 'es', 'ko', 'nl'].map((lang) => (
                    <span 
                      key={lang} 
                      className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
                      aria-label={`${t('language')}: ${lang}`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🔹 Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
              © {new Date().getFullYear()} Luvika — {t('copyright')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/sitemap.xml" className="text-gray-500 hover:text-white transition-colors">{t('sitemap')}</Link>
              <span className="hidden md:inline text-gray-700">•</span>
              <Link href="/security" className="text-gray-500 hover:text-white transition-colors">{t('security')}</Link>
              <span className="hidden md:inline text-gray-700">•</span>
              <Link href="/status" className="text-gray-500 hover:text-white transition-colors">{t('status')}</Link>
            </div>
          </div>
          
          {/* 🔹 Trust badges + Contact info */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-500">
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{t('operational')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>{t('made_in_africa')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{t('gdpr_compliant')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Kinshasa, RDC</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href="mailto:support@luvika.me" className="hover:text-white transition-colors">
                  support@luvika.me
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🔹 Animated wave divider */}
      <div className="relative">
        <svg 
          viewBox="0 0 1440 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 text-gray-900"
        >
          <path 
            d="M0 40L1440 40L1440 0C1200 15 960 15 720 10C480 5 240 0 0 0L0 40Z" 
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* 🔹 Global styles */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 30s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>
    </footer>
  );
}