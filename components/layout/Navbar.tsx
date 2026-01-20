// components/layout/Navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Globe,
  LogOut,
  Shield,
  User as UserIcon,
  X as XIcon,
  Eye,
  ShieldAlert,
  Snowflake,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

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

// 🔹 Calcule la complétion du profil (0–100%)
const getProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  const simpleFields = [
    'full_name',
    'username',
    'job_title',
    'bio_short',
    'email',
    'phone',
    'address',
    'website',
    'instagram',
    'avatar_url',
    'nickname',
    'pronouns',
    'birth_day',
    'city'
  ];

  const filledSimple = simpleFields.filter(field =>
    profile[field] != null && 
    profile[field].toString().trim().length > 0
  ).length;

  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const totalFields = simpleFields.length + 1;
  const filled = filledSimple + (hasSkills ? 1 : 0);

  return Math.min(100, Math.round((filled / totalFields) * 100));
};

// ✨ Styles : bulles, transparence totale, animations douces
const GlowingIconsStyle = `
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4),
                0 0 12px 4px rgba(59, 130, 246, 0.6);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0),
                0 0 24px 8px rgba(59, 130, 246, 0.3);
  }
}
@keyframes floatBubble {
  0% { transform: translateY(0) scale(1); opacity: 0.5; }
  100% { transform: translateY(-120px) scale(1.6); opacity: 0; }
}
.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%);
  filter: blur(0.8px);
  opacity: 0.4;
  mix-blend-mode: screen;
}
.bubble-1 { animation: floatBubble 7s infinite; left: 8%; top: 100%; width: 22px; height: 22px; }
.bubble-2 { animation: floatBubble 9s infinite; left: 22%; top: 105%; animation-delay: 1.2s; width: 14px; height: 14px; }
.bubble-3 { animation: floatBubble 8s infinite; left: 42%; top: 102%; animation-delay: 0.7s; width: 30px; height: 30px; }
.bubble-4 { animation: floatBubble 11s infinite; left: 62%; top: 100%; animation-delay: 0.3s; width: 18px; height: 18px; }
.bubble-5 { animation: floatBubble 10s infinite; left: 82%; top: 107%; animation-delay: 2.1s; width: 26px; height: 26px; }
body.signout-open {
  overflow: hidden;
  overscroll-behavior: contain;
}
`;

// 🔹 Composant bulles (réutilisable partout)
const IceBubbles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="bubble bubble-1" />
    <div className="bubble bubble-2" />
    <div className="bubble bubble-3" />
    <div className="bubble bubble-4" />
    <div className="bubble bubble-5" />
  </div>
);

// 🔹 Modale secondaire — après déconnexion
function FarewellModal({
  isOpen,
  onClose,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur z-[200] flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-sm mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="backdrop-blur-xl bg-white/20 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/10 p-6 text-center shadow-xl">
              <div className="text-6xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
                {t('navbar.farewell_title')}
              </h3>
              <p className="text-gray-200 mb-5 drop-shadow-sm">
                {t('navbar.farewell_message')}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-300 hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </Button>
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mt-3">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 🔹 Popup principal — 100% transparent, bulles à l’intérieur
function SignOutConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const startYRef = useRef(0);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - startYRef.current;
    if (deltaY > 0) setDragOffset(Math.min(deltaY, 300));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 120) {
      onClose();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setShowFarewell(true);
    setTimeout(onClose, 300);
  };

  return (
  <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
            onClick={handleBackdropClick}
          >
            <IceBubbles />
          </motion.div>

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{
              y: isDragging ? dragOffset : 0,
              opacity: 1,
              transition: isDragging
                ? { type: 'tween' }
                : { type: 'spring', damping: 26, stiffness: 280 },
            }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-16 xl:mx-28">
              <div className="relative rounded-t-[36px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.35)] overflow-hidden">

                <IceBubbles />

                {/* Handle */}
                <div
                  className="flex justify-center pt-4 pb-3 touch-none cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleStart(e.clientY)}
                  onTouchStart={(e) => handleStart(e.touches[0].clientY)}
                >
                  <div className="w-16 h-1.5 rounded-full bg-white/30" />
                </div>

                {/* Header */}
                <div className="text-center px-6 pt-2">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-inner">
                    <ShieldAlert className="w-8 h-8 text-red-400" />
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {t('navbar.sign_out_confirm_title')}
                  </h3>

                  <p className="text-gray-200 text-sm mt-2 max-w-xs mx-auto">
                    {t('navbar.sign_out_confirm_message')}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 pt-6 pb-8 space-y-4 relative z-10">

                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleConfirm}
                    className="w-full h-14 rounded-xl font-semibold text-base 
                               bg-gradient-to-r from-red-500/80 to-red-600/80 
                               hover:from-red-500 hover:to-red-600 
                               border border-red-400/40 shadow-lg shadow-red-500/30"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {t('navbar.sign_out_confirm_yes')}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className="w-full h-14 rounded-xl text-white border-white/20 
                               hover:bg-white/10 backdrop-blur-md"
                  >
                    <X className="mr-2 h-5 w-5" />
                    {t('navbar.sign_out_confirm_no')}
                  </Button>

                </div>

                {/* Footer signature */}
                <div className="pb-6 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                                   bg-white/5 border border-white/10 text-xs text-gray-300">
                    <Snowflake className="w-3 h-3 text-cyan-300" />
                    Luyenga na yo — Votre paix est scellée
                  </span>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <FarewellModal
      isOpen={showFarewell}
      onClose={() => setShowFarewell(false)}
      t={t}
    />
  </>
);

}
// 🔹 Navbar principal — SEUL EXPORT
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    avatar_url: string | null;
    full_name: string | null;
    username: string | null;
    plan: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations();
  const router = useRouter();

  // 🔹 Détecte si on est sur une page de profil public
  const isPublicProfilePage = /^\/[a-z]{2}\/[^/]+$/.test(pathname) || 
                            /^\/[^/]+$/.test(pathname) && 
                            !['/', '/auth', '/pricing', '/about', '/contact', '/privacy', '/terms', '/cookies', '/download'].some(p => pathname.startsWith(p));

  // 🔹 Ne pas afficher le header sur les profils publics
  if (isPublicProfilePage) {
    return null;
  }

  // 🔥 Charger user + profile au montage
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          supabase
            .from('profiles')
            .select('avatar_url, full_name, username, plan')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => setProfile(data || null));
        } else {
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    };

    fetchUserAndProfile();
  }, []);

  const confirmAndSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const openSignOutConfirm = () => {
    setShowSignOutConfirm(true);
    document.body.classList.add('signout-open');
  };

  const closeSignOutConfirm = () => {
    setShowSignOutConfirm(false);
    document.body.classList.remove('signout-open');
  };

  const changeLanguage = (newLocale: Locale) => {
    const supported: Locale[] = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'];
    const segments = pathname.split('/');
    if (segments.length > 1 && supported.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || '/';
    router.push(newPath);
    setMobileMenuOpen(false);
  };

  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const isUser = user && !isAdmin;

  const navLinks = !isAdmin && !isUser
    ? [
        { href: '/', label: t('navbar.home') },
        { href: '/#features', label: t('navbar.features') },
        { href: `/${locale}/pricing`, label: t('navbar.pricing') },
        { href: `/${locale}/about`, label: t('navbar.about') },
        { href: `/${locale}/contact`, label: t('navbar.contact') },
        { href: `/${locale}/download`, label: t('navbar.download') },
      ]
    : [];

  if (loading) return null;

  return (
    <>
      <style>{GlowingIconsStyle}</style>
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-4 mt-4 rounded-2xl border border-white/15 backdrop-blur-xl bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-500 hover:border-cyan-300/30 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]">
          <div className="container mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Link
                href={isAdmin ? '/admin' : isUser ? '/dashboard' : '/'}
                className="flex items-center space-x-2 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200 transition-all">
                  LUVIKA
                </span>
                {isAdmin && <Shield className="ml-1 h-5 w-5" />}
                {isUser && <UserIcon className="ml-1 h-5 w-5" />}
              </Link>
            </motion.div>

            <nav className={`hidden md:flex space-x-0.5 ${isAdmin ? 'opacity-50 pointer-events-none' : ''}`} aria-disabled={isAdmin}>
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <Link
                    href={link.href}
                    className="relative px-3 py-2 rounded-xl text-gray-300 font-medium text-sm sm:text-base transition-all duration-300 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-cyan-400/30 transition-all duration-500" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              {isAdmin && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/admin">
                    <Button variant="default" className="px-4 py-2 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative z-10">
                      <span className="relative z-10 flex items-center gap-1">TABLEAU DE BORD</span>
                      <div className="absolute inset-0 animated-bg-admin rounded-xl blur-sm opacity-70 -z-10" />
                    </Button>
                  </Link>
                </motion.div>
              )}

              {isUser && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/dashboard">
                    <Button variant="default" className="px-4 py-2 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative z-10">
                      <span className="relative z-10 flex items-center gap-1">TABLEAU DE BORD</span>
                      <div className="absolute inset-0 animated-bg-user rounded-xl blur-sm opacity-70 -z-10" />
                    </Button>
                  </Link>
                </motion.div>
              )}

              {!isAdmin && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className="text-gray-300 hover:text-cyan-200 hover:bg-white/10 px-3 rounded-xl transition-all duration-300"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="font-medium">{languages[locale].flag}</span>
                  </Button>
                  <div
                    className={`absolute right-0 mt-2 w-40 glass-border py-1 z-50 ${
                      showLangDropdown ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
                    } transition-opacity duration-300 rounded-xl max-h-48 overflow-y-auto`}
                  >
                    {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          changeLanguage(lang);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-white/10 transition-all rounded-lg text-sm ${
                          locale === lang ? 'text-cyan-300' : 'text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{languages[lang].flag}</span>
                        <span>{languages[lang].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔹 PROFIL UTILISATEUR — AVATAR + MENU */}
              {user ? (
                <div className="relative group">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none group-hover:scale-105"
                    aria-label="Menu utilisateur"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || user.email?.charAt(0).toUpperCase()}
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : profile?.full_name ? (
                      <span>
                        {profile.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    ) : user?.email ? (
                      <span>{user.email.charAt(0).toUpperCase()}</span>
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </button>

                  {/* 🔹 Menu déroulant */}
                  <div className="absolute right-0 mt-2 w-64 glass-border py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.user_metadata?.full_name || user.email}</p>
                      {user.user_metadata?.plan && user.user_metadata.plan !== 'basic' && (
                        <Badge
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            user.user_metadata.plan === 'premium'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                          }`}
                        >
                          {user.user_metadata.plan === 'premium' ? '👑 Premium' : '🏢 Entreprise'}
                        </Badge>
                      )}
                    </div>

                    {profile && (
                      <div className="px-4 py-3">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>{t('navbar.profile_completion')}</span>
                          <span>{getProfileCompletion(profile)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getProfileCompletion(profile)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-white/10 hover:text-cyan-300 transition-colors rounded-lg text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        {t('navbar.edit_profile')}
                      </Link>

                      {isUser && user.user_metadata?.username && (
                        <Link
                          href={`/${locale}/${user.user_metadata.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-white/10 hover:text-cyan-300 transition-colors rounded-lg text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Eye className="h-4 w-4 mr-3" />
                          {t('navbar.view_public_profile')}
                        </Link>
                      )}

                      <button
                        onClick={openSignOutConfirm}
                        className="w-full text-left flex items-center px-4 py-2.5 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors rounded-lg text-sm"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('navbar.sign_out')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/auth/sign-in">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl px-5 py-2 text-sm shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20">
                    {t('navbar.sign_in')}
                  </Button>
                </Link>
              )}
            </div>

            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`md:hidden absolute top-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md glass-border rounded-2xl overflow-hidden ${
            mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="p-4 flex flex-col space-y-3">
            {!isAdmin &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-gray-200 hover:text-cyan-200 transition-colors py-2.5 px-4 rounded-xl hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center justify-center">
                  <Button variant="default" className="w-full px-4 py-2 rounded-xl font-bold text-white shadow-md overflow-hidden">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      TABLEAU DE BORD ADMIN
                    </span>
                    <div className="absolute inset-0 animated-bg-admin rounded-xl blur-sm opacity-60 -z-10" />
                  </Button>
                </div>
              </Link>
            )}

            {isUser && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center justify-center">
                  <Button variant="default" className="w-full px-4 py-2 rounded-xl font-bold text-white shadow-md overflow-hidden">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      TABLEAU DE BORD UTILISATEUR
                    </span>
                    <div className="absolute inset-0 animated-bg-user rounded-xl blur-sm opacity-60 -z-10" />
                  </Button>
                </div>
              </Link>
            )}

            {!isAdmin && (
              <div className="pt-3 border-t border-white/10">
                <p className="px-2 text-xs text-gray-400 mb-2">{t('navbar.language')}</p>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs ${
                          locale === lang ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-white/5 text-gray-300'
                        }`}
                      >
                        {languages[lang].flag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 pt-3">
              {user ? (
                <>
                  <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : profile?.full_name ? (
                        profile.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      ) : user?.email ? (
                        user.email.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.user_metadata?.full_name || user.email}</p>
                      {user.user_metadata?.plan && user.user_metadata.plan !== 'basic' && (
                        <Badge
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            user.user_metadata.plan === 'premium'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                          }`}
                        >
                          {user.user_metadata.plan === 'premium' ? '👑 Premium' : '🏢 Entreprise'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-10 text-sm rounded-xl">
                      📝 {t('navbar.edit_profile')}
                    </Button>
                  </Link>

                  {isUser && user.user_metadata?.username && (
                    <Link
                      href={`/${locale}/${user.user_metadata.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full h-10 text-sm rounded-xl">
                        👁️ {t('navbar.view_public_profile')}
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="destructive"
                    onClick={() => {
                      openSignOutConfirm();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full h-10 text-sm rounded-xl"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> {t('navbar.sign_out')}
                  </Button>
                </>
              ) : (
                <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-10 text-sm rounded-xl">
                    {t('navbar.sign_in')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      <SignOutConfirmSheet
        isOpen={showSignOutConfirm}
        onClose={closeSignOutConfirm}
        onConfirm={confirmAndSignOut}
        t={t}
      />
    </>
  );
}