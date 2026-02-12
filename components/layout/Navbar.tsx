// src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, LogOut, User as UserIcon, 
  Globe, Moon, Sun, Shield, Eye 
} from 'lucide-react';
import { createClient } from '../../src/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { SiSocialblade } from 'react-icons/si';

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
  } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();

  // Charger thème depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  // Appliquer thème au DOM
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Charger utilisateur et profil
  useEffect(() => {
    const fetchUser = async () => {
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
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    fetchUser();
  }, []);

  // Déconnexion simple
  const handleSignOut = async () => {
    if (window.confirm(t('navbar.sign_out_confirm_message'))) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    }
  };

  // Changement de langue
  const changeLanguage = (newLocale: Locale) => {
    const segments = window.location.pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || '/');
    setMobileMenuOpen(false);
    setShowLangDropdown(false);
  };

  // Détection rôle
  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const isUser = !!user && !isAdmin;

  // Liens publics
  const navLinks = [
    { href: '/', label: t('navbar.home') },
    { href: '/#features', label: t('navbar.features') },
    { href: `/${locale}/public/pricing`, label: t('navbar.pricing') },
    { href: `/${locale}/public/about`, label: t('navbar.about') },
    { href: `/${locale}/public/contact`, label: t('navbar.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-4 mt-4 rounded-2xl border border-white/15 backdrop-blur-xl bg-white/5 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          {/* 🔹 Logo LUVIKA */}
<Link
  href={isAdmin ? '/admin' : isUser ? '/dashboard' : '/'}
  className="flex items-center gap-3 group"
>
  {/* Icône */}
  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
    <SiSocialblade className="w-5 h-5 text-white" />
  </div>

  {/* Texte */}
  <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
    LUVIKA
  </span>

  {/* Badge Admin */}
  {isAdmin && (
    <Shield className="w-5 h-5 text-red-400 drop-shadow-sm" />
  )}
</Link>


          {/* Menu desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isAdmin && !isUser && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Thème */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="text-gray-300 hover:text-cyan-200 hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Langue */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLangDropdown(prev => !prev)}
                className="text-gray-300 hover:text-cyan-200 hover:bg-white/10"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>{languages[locale].flag}</span>
              </Button>
              
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-black/80 border border-white/10 rounded-xl py-1 z-50">
                  {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-white/10 transition-colors ${
                        locale === lang ? 'text-cyan-300' : 'text-gray-300'
                      }`}
                    >
                      <span className="text-lg">{languages[lang].flag}</span>
                      <span>{languages[lang].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons dashboard / connexion */}
            {isAdmin ? (
              <Link href="/admin">
                <Button variant="default" className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400">
                  Admin
                </Button>
              </Link>
            ) : isUser ? (
              <Link href="/dashboard">
                <Button variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300">
                  Tableau de bord
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-in">
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                  {t('navbar.sign_in')}
                </Button>
              </Link>
            )}

            {/* Menu utilisateur */}
            {user && (
              <div className="relative group ml-2">
                <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || ''} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-white font-bold">
                      {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                <div className="absolute right-0 mt-2 w-56 bg-black/80 border border-white/10 rounded-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    {profile?.plan && profile.plan !== 'basic' && (
                      <Badge className="mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                        {profile.plan === 'premium' ? '⭐ Premium' : '💼 Business'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-cyan-300 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      {t('navbar.edit_profile')}
                    </Link>
                    
                    {isUser && profile?.username && (
                      <Link
                        href={`/${locale}/${profile.username}`}
                        target="_blank"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-cyan-300 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('navbar.view_public_profile')}
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center px-4 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('navbar.sign_out')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 border border-white/10 rounded-b-2xl mx-4 mb-4 p-4 space-y-4">
            {/* Thème + Langue mobile */}
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="text-gray-300 hover:text-cyan-200"
              >
                {theme === 'light' ? <Moon className="h-4 w-4 mr-1" /> : <Sun className="h-4 w-4 mr-1" />}
                Thème
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLangDropdown(prev => !prev)}
                  className="text-gray-300 hover:text-cyan-200"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {languages[locale].flag}
                </Button>
                
                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-black/80 border border-white/10 rounded-xl py-1 z-50">
                    {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-white/10 ${
                          locale === lang ? 'text-cyan-300' : 'text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{languages[lang].flag}</span>
                        <span>{languages[lang].name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Liens publics mobile */}
            {!isAdmin && !isUser && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Actions mobile */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {isAdmin ? (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400">
                    Admin Dashboard
                  </Button>
                </Link>
              ) : isUser ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300">
                    Tableau de bord
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                    {t('navbar.sign_in')}
                  </Button>
                </Link>
              )}
              
              {user && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('navbar.sign_out')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}