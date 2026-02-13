// src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, LogOut, User as UserIcon, 
  Globe, Moon, Sun, Shield, Eye, Sparkle, 
  CreditCard, Crown, AlertCircle,
  Heart
} from 'lucide-react';
import { createClient } from '../../src/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { SiSocialblade } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

type Locale = 'ar' | 'en' | 'es' | 'fr' | 'kg' | 'ln' | 'nl' | 'pt' | 'sw';

const languages: Record<Locale, { name: string; flag: string }> = {
  ar: { name: 'العربية', flag: '🇸🇦' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  kg: { name: 'Kikongo', flag: '🇨🇩' },
  ln: { name: 'Lingála', flag: '🇨🇩' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  pt: { name: 'Português', flag: '🇵🇹' },
  sw: { name: 'Kiswahili', flag: '🇹🇿' },
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    avatar_url: string | null;
    full_name: string | null;
    username: string | null;
    plan: string | null;
    likes_count?: number;
  } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();

  // 🔹 Chargement thème
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 🔹 Chargement utilisateur + profil
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data : { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { data : profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan, likes_count')
          .eq('id', session.user.id)
          .single();
        if (profileData) setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Reset avatarError quand URL change
  useEffect(() => {
    if (profile?.avatar_url) setAvatarError(false);
    return () => setAvatarError(false);
  }, [profile?.avatar_url]);

  // 🔹 Déconnexion
  const handleSignOut = async () => {
    if (!window.confirm(t('navbar.sign_out_confirm_message'))) return;
    
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  // 🔹 Changement langue
  const changeLanguage = (newLocale: Locale) => {
    const segments = window.location.pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || '/');
    setMobileMenuOpen(false);
    setShowLangDropdown(false);
  };

  // 🔹 Détection rôle
  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const isUser = !!user && !isAdmin;

  // 🔹 Liens publics
  const navLinks = useMemo(() => [
    { href: '/', label: t('navbar.home') },
    { href: '/#features', label: t('navbar.features') },
    { href: `/${locale}/public/pricing`, label: t('navbar.pricing') },
    { href: `/${locale}/public/about`, label: t('navbar.about') },
    { href: `/${locale}/public/contact`, label: t('navbar.contact') },
  ], [locale, t]);

  // 🔹 Initial utilisateur
  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  // 🔹 Gestion erreur avatar
  const handleAvatarError = () => {
    setAvatarError(true);
    console.warn('⚠️ Erreur chargement avatar');
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 backdrop-blur-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-2xl shadow-black/40 overflow-hidden"
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            {/* 🔹 Logo LUVIKA - Design Premium */}
            <Link
              href={isAdmin ? '/admin' : isUser ? '/dashboard' : '/'}
              className="flex items-center gap-3 group transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-ping rounded-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <SiSocialblade className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
              
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  LUVIKA
                </span>
                <span className="text-[10px] font-medium text-cyan-400/80 mt-0.5 tracking-wider uppercase hidden md:block">
                  Digital Identity
                </span>
              </div>

              {isAdmin && (
                <Badge className="ml-2 bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1 text-xs py-0.5 px-2">
                  <Shield className="w-3 h-3" /> Admin
                </Badge>
              )}
            </Link>

            {/* 🔹 Menu desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {!isAdmin && !isUser && navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={link.href}
                    className="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm font-medium relative overflow-hidden group"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* 🔹 Actions desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {/* 🔹 Thème */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  className="text-gray-300 hover:text-cyan-200 hover:bg-white/10 rounded-xl transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-300" />
                  )}
                </Button>
              </motion.div>

              {/* 🔹 Langue */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLangDropdown(prev => !prev)}
                    className="text-gray-300 hover:text-cyan-200 hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <Globe className="h-5 w-5" />
                  </Button>
                </motion.div>
                
                <AnimatePresence>
                  {showLangDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-800/90 border border-white/10 backdrop-blur-xl rounded-2xl py-2 shadow-2xl shadow-black/50 z-50 overflow-hidden"
                    >
                      {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                        <motion.button
                          key={lang}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => changeLanguage(lang)}
                          className={`w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-white/10 transition-colors ${
                            locale === lang ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-200 font-medium' : 'text-gray-300'
                          }`}
                        >
                          <span className="text-xl">{languages[lang].flag}</span>
                          <span className="font-medium">{languages[lang].name}</span>
                          {locale === lang && (
                            <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0.5 px-2">
                              Actif
                            </Badge>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 🔹 Boutons dashboard / connexion */}
              {isAdmin ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold shadow-md shadow-amber-500/30">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                </motion.div>
              ) : isUser ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/30">
                      <Sparkle className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth/sign-in">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/30">
                      {t('navbar.sign_in')}
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* 🔹 Menu utilisateur - DESIGN ULTIME */}
              {user && (
                <div className="relative ml-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                    className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 shadow-lg transition-all duration-300 group"
                  >
                    {profile?.avatar_url && !avatarError ? (
                      <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={profile.avatar_url}
                        alt={profile.full_name || user.email || 'Avatar'}
                        onError={handleAvatarError}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                      >
                        {getUserInitial()}
                      </motion.div>
                    )}
                    
                    {/* 🔹 Badge plan */}
                    {profile?.plan && profile.plan !== 'basic' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          profile.plan === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-purple-500'
                        } animate-pulse`}></div>
                      </div>
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onMouseEnter={() => setShowUserMenu(true)}
                        onMouseLeave={() => setShowUserMenu(false)}
                        className="absolute right-0 mt-2 w-64 bg-slate-800/95 border border-white/10 backdrop-blur-xl rounded-2xl py-2 shadow-2xl shadow-black/60 z-50 overflow-hidden"
                      >
                        {/* 🔹 En-tête utilisateur */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold text-xl">{getUserInitial()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">
                                {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {profile?.plan && (
                                  <Badge className={`text-[11px] py-0.5 px-2 ${
                                    profile.plan === 'premium' 
                                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold' 
                                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }`}>
                                    {profile.plan === 'premium' ? (
                                      <>
                                        <Crown className="w-3 h-3 mr-0.5 inline" /> Premium
                                      </>
                                    ) : (
                                      <>
                                        <Briefcase className="w-3 h-3 mr-0.5 inline" /> Business
                                      </>
                                    )}
                                  </Badge>
                                )}
                                {user?.user_metadata?.role === 'admin' && (
                                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] py-0.5 px-2">
                                    <Shield className="w-2.5 h-2.5 mr-0.5 inline" /> Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <UserIcon className="w-4 h-4 text-cyan-400" />
                            <span className="font-medium">{t('navbar.edit_profile')}</span>
                          </Link>
                          
                          {isUser && profile?.username && (
                            <Link
                              href={`/${locale}/${profile.username}`}
                              target="_blank"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Eye className="w-4 h-4 text-emerald-400" />
                              <span className="font-medium">{t('navbar.view_public_profile')}</span>
                              
                              {/* 🔹 Statistiques à droite */}
                              <div className="ml-auto flex items-center gap-1.5 text-xs">
                                <div className="flex items-center gap-0.5 text-pink-400">
                                  <Heart className="w-3 h-3 fill-current" />
                                  <span>{profile.likes_count || 0}</span>
                                </div>
                              </div>
                            </Link>
                          )}
                        </div>

                        <div className="py-1 border-t border-white/5 mt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">{t('navbar.sign_out')}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* 🔹 Menu mobile - Bouton */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-gray-300 hover:text-cyan-200"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>

          {/* 🔹 Mobile menu - DESIGN ULTIME */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-white/10"
              >
                <div className="p-4 space-y-3">
                  {/* 🔹 Thème + Langue mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
                    <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                        className="w-full bg-white/5 border-white/20 hover:bg-white/10 text-gray-300"
                      >
                        {theme === 'light' ? (
                          <>
                            <Moon className="h-4 w-4 mr-2" />
                            Mode sombre
                          </>
                        ) : (
                          <>
                            <Sun className="h-4 w-4 mr-2 text-yellow-300" />
                            Mode clair
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <div className="relative w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setShowLangDropdown(prev => !prev)}
                        className="w-full bg-white/5 border-white/20 hover:bg-white/10 text-gray-300 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{languages[locale].name}</span>
                        </div>
                        <span className="text-lg">{languages[locale].flag}</span>
                      </Button>
                      
                      <AnimatePresence>
                        {showLangDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-full bg-slate-800/90 border border-white/10 backdrop-blur-xl rounded-2xl py-2 shadow-2xl shadow-black/50 z-50"
                          >
                            {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                              <motion.button
                                key={lang}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => changeLanguage(lang)}
                                className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-white/10 ${
                                  locale === lang ? 'text-cyan-300 font-medium' : 'text-gray-300'
                                }`}
                              >
                                <span>{languages[lang].name}</span>
                                <span className="text-xl">{languages[lang].flag}</span>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 🔹 Liens publics mobile */}
                  {!isAdmin && !isUser && navLinks.map((link) => (
                    <motion.div
                      key={link.href}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={link.href}
                        className="block py-3 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* 🔹 Actions mobile */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    {isAdmin ? (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      </motion.div>
                    ) : isUser ? (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">
                            <Sparkle className="w-4 h-4 mr-2" />
                            Tableau de bord
                          </Button>
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                            {t('navbar.sign_in')}
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                    
                    {user && (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('navbar.sign_out')}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </header>
  );
}

// 🔹 Icône manquante
import { Briefcase } from 'lucide-react';