// src/components/admin/AdminHeader.tsx
'use client';

import Link from 'next/link';
import { LogOut, Settings, Globe, User, Eye, Heart } from 'lucide-react'; // Import des icônes nécessaires
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { createClient } from '../../../src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

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
  // États pour l'utilisateur et le profil
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true); // Pour le chargement initial de l'user

  // Fonction pour charger l'utilisateur et le profil
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !authUser) {
          console.error("Erreur chargement utilisateur:", userError);
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(authUser);

        // Récupérer le profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, likes_count, views_count') // Ajouter views_count si tu le stockes
          .eq('id', authUser.id)
          .single();

        if (profileError && Object.keys(profileError).length > 0) {
          console.error("Erreur chargement profil:", profileError);
          // Même si le profil n'existe pas encore, on continue avec un profil vide
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Erreur dans useEffect:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [supabase]);

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

  // Fonction pour obtenir l'initial de l'utilisateur
  const getUserInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Valeur par défaut
  };

  // Fonction pour gérer le clic sur "Voir le profil public"
  const handleViewPublicProfile = (username: string) => {
    // Ouvrir dans un nouvel onglet
    window.open(`/${locale}/${username}`, '_blank');
  };

  if (loadingUser) {
    // Optionnel : Afficher un loader léger pour le bouton utilisateur
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-semibold text-white tracking-wide"
          >
            <div className="p-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
              <Settings className="w-5 h-5 text-cyan-300" />
            </div>
            Admin LUVIKA
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
            >
              <Globe className="w-4 h-4 mr-1" />
              {languages[locale as keyof typeof languages]?.flag || '🌐'}
            </Button>

            {/* Placeholder pour le bouton utilisateur */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
              disabled // Désactivé pendant le chargement
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

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
                className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md relative" // Ajouté 'relative'
              >
                {/* Icône ou Avatar */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || user?.email || 'Avatar'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/30" // Taille et style de l'avatar
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitial()}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-white/10 w-56">
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')} // Lien vers les paramètres du dashboard
                className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                {t('profile.edit')} {/* Assurez-vous que cette clé existe dans votre fichier de traduction */}
              </DropdownMenuItem>
              {/* 🔹 MenuItem "Voir le profil public" */}
              {profile?.username && ( // S'affiche seulement si profile et username existent
                 <DropdownMenuItem
                   onClick={() => handleViewPublicProfile(profile.username)} // 🔸 Appelle la fonction avec le username
                   className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white"
                 >
                   <Eye className="w-4 h-4" />
                   {t('profile.view_public')} {/* Assurez-vous que cette clé existe dans votre fichier de traduction */}
                   {/* Icônes Likes/Vues à droite */}
                   <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                     <Heart className="w-3 h-3 text-pink-400 fill-current" />
                     <span>{profile.likes_count || 0}</span>
                     {/* Optionnel : Icône Œil pour les vues si tu as views_count */}
                     {/* <Eye className="w-3 h-3 text-cyan-400" />
                     <span>{profile.views_count || 0}</span> */}
                   </div>
                 </DropdownMenuItem>
               )}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.signout')} {/* Assurez-vous que cette clé existe dans votre fichier de traduction */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}