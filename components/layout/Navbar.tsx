// src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';

type Locale = 'fr' | 'ln' | 'en';

const languages: Record<Locale, { name: string; flag: string }> = {
  fr: { name: 'Français', flag: '🇫🇷' },
  ln: { name: 'Lingála', flag: '🇨🇩' },
  en: { name: 'English', flag: '🇬🇧' },
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();

  const changeLanguage = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
    setMobileMenuOpen(false);
  };

  // Liens de navigation
const navLinks = [
  { href: '/', label: t('navbar.home') },
  { href: '/#features', label: t('navbar.features') },
  { href: `/${locale}/pricing`, label: t('navbar.pricing') },
  { href: `/${locale}/about`, label: t('navbar.about') },
  { href: `/${locale}/contact`, label: t('navbar.contact') },
  { href: `/${locale}/download`, label: t('navbar.download') },
];


  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ✨ Conteneur transparent avec bordure glacée */}
      <div className="
        mx-4
        mt-4
        rounded-2xl
        border
        border-white/15
        backdrop-blur-xl
        bg-white/5
        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
        transition-all
        duration-500
        hover:border-cyan-300/30
        hover:shadow-[0_12px_40px_rgba(59,130,246,115)]
      ">
        <div className="container mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200 transition-all">
                LUVIKA
              </span>
            </Link>
          </motion.div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex space-x-0.5">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="
                    relative
                    px-3
                    py-2
                    rounded-xl
                    text-gray-300
                    font-medium
                    text-sm
                    sm:text-base
                    transition-all
                    duration-300
                    group
                  "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  {/* ✨ Bordure interne subtile au survol */}
                  <div className="
                    absolute inset-0
                    rounded-xl
                    border
                    border-transparent
                    group-hover:border-cyan-400/30
                    transition-all
                    duration-500
                  " />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTAs + Langue (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="
                  text-gray-300 hover:text-cyan-200
                  hover:bg-white/10
                  px-3
                  rounded-xl
                  transition-all
                  duration-300
                  group
                "
              >
                <Globe className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">{languages[locale].flag}</span>
              </Button>
              <div className="
                absolute
                right-0
                mt-2
                w-40
                glass-border
                py-1
                z-50
                opacity-0
                group-hover:opacity-100
                pointer-events-none
                group-hover:pointer-events-auto
                transition-opacity
                duration-300
                rounded-xl
              ">
                {(['fr', 'ln', 'en'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`
                      w-full
                      px-3
                      py-2
                      text-left
                      flex
                      items-center
                      space-x-2
                      hover:bg-white/10
                      transition-all
                      rounded-lg
                      text-sm
                      ${locale === lang ? 'text-cyan-300' : 'text-gray-300'}
                    `}
                  >
                    <span className="text-lg">{languages[lang].flag}</span>
                    <span>{languages[lang].name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link href="/auth/sign-in">
              <Button 
                variant="ghost" 
                className="
                 bg-gradient-to-r from-blue-600 to-cyan-500
                  hover:from-blue-500 hover:to-cyan-400
                  rounded-xl
                  px-5
                  py-2
                  text-sm
                  shadow-lg
                  shadow-cyan-500/10
                  hover:shadow-cyan-500/20
                "
              >
                {t('navbar.sign_in')}
              </Button>
            </Link>
           
          </div>

          {/* Menu Mobile (hamburger) */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu flottant (pas dans le glass) */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`
          md:hidden
          absolute
          top-20
          left-1/2
          transform
          -translate-x-1/2
          w-11/12
          max-w-md
          glass-border
          rounded-2xl
          overflow-hidden
          ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        <div className="p-4 flex flex-col space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                text-base
                font-medium
                text-gray-200
                hover:text-cyan-200
                transition-colors
                py-2.5
                px-4
                rounded-xl
                hover:bg-white/5
              "
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10">
            <p className="px-2 text-xs text-gray-400 mb-2">{t('navbar.language')}</p>
            <div className="flex gap-2">
              {(['fr', 'ln', 'en'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`
                    flex items-center justify-center
                    w-8 h-8
                    rounded-xl
                    text-xs
                    ${
                      locale === lang
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-white/5 text-gray-300'
                    }
                  `}
                >
                  {languages[lang].flag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-3">
            <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full h-10 text-sm rounded-xl">
                {t('navbar.sign_in')}
              </Button>
            </Link>
            <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-10 text-sm rounded-xl">
                {t('navbar.sign_up')}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
}