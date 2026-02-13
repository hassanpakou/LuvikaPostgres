// src/components/admin/AdminHeader.tsx
'use client';

import Link from 'next/link';
import { LogOut, Settings, Globe, User, Eye, Heart, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';
import { createClient } from '../../../src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { SiSocialblade } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // ✅ FONCTION SÉCURISÉE POUR LE COMPTAGE
const fetchUnreadCount = async (p0: number) => {
  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('profile_id', user); // ✅ Ajoute le filtre utilisateur si nécessaire

    if (error) throw error;
    fetchUnreadCount(count || 0);
  } catch (err) {
    console.error('❌ Erreur fetch unread count:', err);
    fetchUnreadCount(0);
    toast.error('Impossible de charger les messages non lus');
  }
};


  // 🔹 Chargement utilisateur + profil avec gestion d'erreurs robuste
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !authUser) {
          console.warn("⚠️ Utilisateur non authentifié ou erreur session");
          if (userError?.message.includes('Invalid API key')) {
            toast.error('❌ Session expirée', { description: 'Veuillez vous reconnecter' });
          }
          router.push('/auth/sign-in');
          return;
        }

        setUser(authUser);

        // 🔹 Récupération profil avec gestion fine des erreurs
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, likes_count, views_count, plan, role')
          .eq('id', authUser.id)
          .single();

        // ✅ Gestion spécifique : profil inexistant ≠ erreur
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log('ℹ️ Profil non créé - création en attente');
            setProfile(null);
          } else {
            console.error('❌ Erreur BDD profil:', profileError.message);
            toast.error('Erreur chargement profil', { 
              description: profileError.message,
              duration: 5000 
            });
            setProfile(null);
          }
        } else {
          setProfile(profileData);
        }
      } catch (err: any) {
        console.error('💥 Erreur critique AdminHeader:', err);
        toast.error('Erreur système', { 
          description: err.message || 'Une erreur inattendue est survenue',
          duration: 6000 
        });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  // 🔹 Reset avatarError quand l'URL change + gestion robuste
useEffect(() => {
  // Réinitialise l'erreur si une nouvelle URL est présente
  if (profile?.avatar_url) {
    setAvatarError(false);
  }
  
  // Nettoyage si le composant est démonté
  return () => {
    setAvatarError(false);
  };
}, [profile?.avatar_url]);

  // 🔹 Déconnexion sécurisée
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('✅ Déconnexion réussie', { duration: 2000 });
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('❌ Échec déconnexion');
    }
  };

  // 🔹 Changement de langue
  const changeLanguage = (lang: string) => {
    const currentPath = window.location.pathname.replace(/^\/[a-z]{2}/, '');
    router.push(`/${lang}${currentPath}`);
    setOpenLang(false);
    toast.success(`✅ Langue changée : ${languages[lang as keyof typeof languages]?.name}`, { duration: 1500 });
  };

  // 🔹 Initial utilisateur avec fallback robuste
  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  // 🔹 Voir profil public
  const handleViewPublicProfile = (username: string) => {
    if (!username) {
      toast.error('⚠️ Profil non configuré', { description: 'Veuillez compléter votre profil' });
      return;
    }
    window.open(`/${locale}/${username}`, '_blank', 'noopener,noreferrer');
  };

  // 🔹 Gestion erreur avatar
  const handleAvatarError = () => {
    setAvatarError(true);
    console.warn('⚠️ Erreur chargement avatar - utilisation fallback');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔹 Logo LUVIKA - Design Premium */}
          <Link
            href="/admin"
            className="flex items-center gap-2.5 group transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-ping rounded-xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SiSocialblade className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                LUVIKA
              </span>
              <span className="text-[10px] font-medium text-cyan-400/80 mt-0.5 tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* 🔹 Actions : Langues + Menu utilisateur - Design Ultime */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🔹 Sélecteur de langue amélioré */}
            <DropdownMenu open={openLang} onOpenChange={setOpenLang}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    relative h-10 px-3 rounded-xl
                    text-gray-300 hover:text-cyan-200 hover:bg-white/5
                    border border-white/10 backdrop-blur-md
                    transition-all duration-300
                    ${openLang ? 'bg-white/5 text-cyan-300 border-cyan-500/30 shadow-lg shadow-cyan-500/10' : ''}
                  `}
                >
                  <Globe className="w-4 h-4 mr-1.5" />
                  <span className="font-medium hidden sm:inline">
                    {languages[locale as keyof typeof languages]?.name || 'Langue'}
                  </span>
                  <span className="ml-1 text-lg">
                    {languages[locale as keyof typeof languages]?.flag || '🌐'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent
                align="end"
                className="bg-slate-800/90 border border-white/10 backdrop-blur-xl w-48 py-2 shadow-2xl shadow-black/50"
              >
                {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`
                      cursor-pointer flex items-center gap-2.5 px-3 py-2.5
                      transition-all duration-200
                      ${
                        locale === lang 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 font-medium' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{languages[lang].flag}</span>
                    <span className="font-medium">{languages[lang].name}</span>
                    {locale === lang && (
                      <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-0.5 px-2">
                        Actif
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 🔹 Menu utilisateur - Design Premium avec AVATAR CORRIGÉ */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className={`
        relative h-10 w-10 rounded-full  // ✅ CHANGÉ: rounded-xl → rounded-full
        text-gray-300 hover:text-white hover:bg-white/10
        border border-white/10 backdrop-blur-md
        transition-all duration-300 overflow-hidden
        ${loadingUser ? 'animate-pulse' : ''}
      `}
    >
      {loadingUser ? (
        // 🔹 Skeleton loader rond
        <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
      ) : profile?.avatar_url ? (  // ✅ SUPPRIMÉ: && !avatarError
        // 🔹 Avatar TOUJOURS affiché si URL présente (gestion d'erreur intégrée)
        <motion.img
          key={profile.avatar_url} // ✅ Force le re-rendu si URL change
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={profile.avatar_url}
          alt={profile.full_name || user?.email || 'Avatar'}
          onError={(e) => {
            console.warn('⚠️ Erreur chargement avatar:', profile.avatar_url);
            // Masque l'image en cas d'erreur mais ne bloque pas le fallback
            (e.target as HTMLImageElement).style.display = 'none';
            setAvatarError(true);
          }}
          className={`
            w-full h-full rounded-full object-cover 
            border-2 border-white/20 shadow-md
            hover:shadow-cyan-500/30 transition-shadow
            ${avatarError ? 'hidden' : ''} // ✅ Masque SI erreur
          `}
        />
      ) : null}
      
      {/* 🔹 Fallback TOUJOURS présent (s'affiche si pas d'URL ou erreur) */}
      {(loadingUser || !profile?.avatar_url || avatarError) && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`
            absolute inset-0 rounded-full 
            bg-gradient-to-br from-cyan-500 to-blue-600 
            flex items-center justify-center text-white font-bold text-lg shadow-md
            ${profile?.avatar_url && !avatarError ? 'opacity-0' : 'opacity-100'} // ✅ Transition fluide
            transition-opacity duration-300
          `}
        >
          {getUserInitial()}
        </motion.div>
      )}
      
      {/* 🔹 Badge admin subtil */}
      {user?.user_metadata?.role === 'admin' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900 animate-pulse"></div>
      )}
    </Button>
  </DropdownMenuTrigger>
  
              
              <DropdownMenuContent 
                align="end" 
                className="bg-slate-800/95 border border-white/10 backdrop-blur-xl w-64 p-2 shadow-2xl shadow-black/60 mt-1"
              >
                {/* 🔹 En-tête utilisateur */}
                <div className="px-3 py-2.5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{getUserInitial()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">
                        {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {user?.user_metadata?.role === 'admin' && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] py-0.5 px-1.5">
                            <Shield className="w-2.5 h-2.5 mr-0.5 inline" /> Admin
                          </Badge>
                        )}
                        {profile?.plan && (
                          <Badge className={`text-[10px] py-0.5 px-1.5 ${
                            profile.plan === 'premium' 
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                              : profile.plan === 'entreprise'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}>
                            {profile.plan === 'premium' ? '⭐ Premium' : profile.plan === 'entreprise' ? '🏢 Entreprise' : '🆓 Basic'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-white/5 my-1" />

                {/* 🔹 Actions utilisateur */}
                <div className="py-1">
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                    className="cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">{t('profile.edit')}</span>
                  </DropdownMenuItem>
                  
                  {profile?.username && (
                    <DropdownMenuItem
                      onClick={() => handleViewPublicProfile(profile.username)}
                      className="cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">{t('profile.view_public')}</span>
                      
                      {/* 🔹 Statistiques à droite */}
                      <div className="ml-auto flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-0.5 text-pink-400">
                          <Heart className="w-3 h-3 fill-current" />
                          <span>{profile.likes_count || 0}</span>
                        </div>
                        {profile.views_count !== undefined && (
                          <div className="flex items-center gap-0.5 text-cyan-400">
                            <Eye className="w-3 h-3" />
                            <span>{profile.views_count}</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-white/5 my-1" />

                {/* 🔹 Déconnexion */}
                <div className="py-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">{t('auth.signout')}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

// 🔹 Icône Shield manquante (à ajouter en haut du fichier)
import { Shield } from 'lucide-react';