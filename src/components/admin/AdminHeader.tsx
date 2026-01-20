// src/components/admin/AdminHeader.tsx
'use client';

import Link from 'next/link';
import { LogOut, Settings, Globe, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

// Langues supportées
const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  pt: { name: 'Português', flag: '🇵🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  sw: { name: 'Kiswahili', flag: '🇹🇿' },
  ln: { name: 'Lingala', flag: '🇨🇩' },
  kg: { name: 'Kikongo', flag: '🇨🇬' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
};

export function AdminHeader() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations();
  const locale = useLocale();
  const [openLang, setOpenLang] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/sign-in');
  };

  const changeLanguage = (lang: string) => {
    // Redirige vers la même page dans la nouvelle langue
    const currentPath = window.location.pathname.replace(/^\/[a-z]{2}/, '');
    router.push(`/${lang}${currentPath}`);
    setOpenLang(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-lg font-semibold text-white tracking-wide"
        >
          <div className="p-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
            <Settings className="w-5 h-5 text-cyan-300" />
          </div>
          Admin LUVIKA
        </Link>

        {/* Actions : Langues + Menu utilisateur */}
        <div className="flex items-center gap-3">
          {/* 🔹 Sélecteur de langue */}
          <DropdownMenu open={openLang} onOpenChange={setOpenLang}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
              >
                <Globe className="w-4 h-4 mr-1" />
                {languages[locale as keyof typeof languages]?.flag || '🌐'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-slate-800 border-white/10 w-48"
            >
              {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const).map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    locale === lang ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300'
                  }`}
                >
                  <span>{languages[lang].flag}</span>
                  <span>{languages[lang].name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 🔹 Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
              >
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-white/10 w-56">
              <DropdownMenuItem
                onClick={() => router.push('/settings/profile')}
                className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                {t('profile.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Récupère le username depuis le localStorage ou Supabase
                  const username = localStorage.getItem('luvika_username');
                  if (username) {
                    window.open(`/${username}`, '_blank');
                  }
                }}
                className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <Eye className="w-4 h-4" />
                {t('profile.view_public')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.signout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}