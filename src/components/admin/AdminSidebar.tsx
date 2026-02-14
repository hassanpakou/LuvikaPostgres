// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, FileText, Users, Crown, 
  ChevronLeft, ChevronRight, X, Sparkle, 
  CreditCardIcon, ShoppingCart, MessageSquare,
  Bell, Settings, LogOut, HelpCircle
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminLayout } from '../../../src/contexts/AdminLayoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../../components/ui/dropdown-menu';
import { createClient } from '../../../src/lib/supabase/client';
import { toast } from 'sonner';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', badge: null },
  { name: 'Utilisateurs', icon: Users, href: '/admin/admin/users', badge: null },
  { name: 'Abonnements', icon: Crown, href: '/admin/admin/subscriptions', badge: null },
  { name: 'Commandes', icon: ShoppingCart, href: '/admin/admin/orders', badge: null },
  { name: 'Cartes NFC', icon: CreditCardIcon, href: '/admin/admin/nfc', badge: null },
  { name: 'Événements', icon: FileText, href: '/admin/admin/events', badge: null },
  { name: 'Messages', icon: MessageSquare, href: '/admin/admin/contact-requests', badge: 'unread_count' },
  { name: 'Blog', icon: FileText, href: '/dashboard/blog', badge: null },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAdminLayout();
  const [showHelp, setShowHelp] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // 🔹 Chargement utilisateur + notifications
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data : { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        
        // 🔹 Récupérer le profil
        const { data : profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan')
          .eq('id', authUser.id)
          .single();
        
        if (profileData) setProfile(profileData);
        
        // 🔹 Compter les messages non lus
        const { count, error } = await supabase
  .from('contact_requests')
  .select('id', { count: 'exact', head: true }) // head: true = pas de données, juste le count
  .eq('is_read', false);

if (error) {
  console.error('Erreur comptage messages non lus:', error);
  setUnreadCount(0);
} else {
  setUnreadCount(count || 0); // ✅ count est directement dans la réponse
}
      }
      
      setLoading(false);
    };

    fetchUserData();
    
    // 🔹 Realtime pour les messages non lus
    const supabase = createClient();
    const channel = supabase
      .channel('contact-requests-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_requests' },
        () => {
          supabase
            .from('contact_requests')
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false)
            .then(({ count }) => setUnreadCount(count || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔹 Déconnexion sécurisée
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('✅ Déconnexion réussie');
    window.location.href = '/auth/sign-in';
  };

  // 🔹 Gestion erreur avatar
  const handleAvatarError = () => setAvatarError(true);

  // 🔹 Menu optimisé avec badges et état actif
  const menuItems = useMemo(() => 
    menu.map(item => {
      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
      const hasBadge = item.badge === 'unread_count' && unreadCount > 0;
      
      return {
        ...item,
        isActive,
        hasBadge,
        badgeContent: hasBadge ? unreadCount : null
      };
    }), 
  [pathname, unreadCount]);

  return (
    <>
      {/* 🔹 Fond animé optimisé - Performant */}
      <div className="fixed left-0 top-0 h-screen w-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 animate-gradient-move"></div>
        
        {/* 🔹 Particules flottantes optimisées */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500/5"
            style={{
              width: `${2 + Math.random() * 6}px`,
              height: `${2 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 30, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-gradient-to-b from-slate-900/95 to-slate-900/85 
          backdrop-blur-xl border-r border-white/10
          shadow-2xl shadow-black/40
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          flex flex-col overflow-hidden
        `}
      >
        {/* 🔹 En-tête avec logo animé */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center justify-between w-full">
            {!isSidebarCollapsed ? (
              <Link href="/admin" className="flex items-center gap-2.5 group">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkle className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    LUVIKA
                  </span>
                  <span className="text-[9px] font-medium text-cyan-400/80 mt-0.5 tracking-wider uppercase">
                    Admin
                  </span>
                </div>
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mx-auto">
                <Sparkle className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* 🔹 Bouton collapse intégré */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={`
                h-8 w-8 rounded-lg text-cyan-300 hover:bg-white/10 hover:text-cyan-200
                transition-all duration-300 absolute right-3
                ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}
              `}
              aria-label={isSidebarCollapsed ? "Développer le menu" : "Réduire le menu"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 🔹 Navigation principale */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5 px-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-300
                    ${item.isActive 
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-white border-l-2 border-cyan-400 shadow-lg shadow-cyan-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }
                    ${isSidebarCollapsed ? 'justify-center w-12 mx-auto' : 'justify-start pl-4'}
                    overflow-hidden
                  `}
                >
                  <div className="relative z-10">
                    <item.icon 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isSidebarCollapsed ? 'mx-auto' : ''
                      }`}
                      style={{ 
                        filter: item.isActive ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))' : ''
                      }} 
                    />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <span className="relative z-10 font-medium transition-all duration-300">
                      {item.name}
                    </span>
                  )}
                  
                  {/* 🔹 Badge notifications */}
                  {item.hasBadge && !isSidebarCollapsed && (
                    <Badge className="ml-auto bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold">
                      {item.badgeContent}
                    </Badge>
                  )}
                  
                  {/* 🔹 Effet hover subtil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* 🔹 Section utilisateur + actions */}
        <div className="border-t border-white/10 p-3">
          {!isSidebarCollapsed ? (
            // 🔹 Version développée
            <div className="space-y-3">
              {/* 🔹 Carte utilisateur */}
              <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                {loading ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                ) : profile?.avatar_url && !avatarError ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || user?.email || 'Avatar'}
                    onError={handleAvatarError}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {(profile?.full_name || user?.email)?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-cyan-300 truncate">
                    {profile?.plan === 'premium' ? '⭐ Premium' : profile?.plan === 'entreprise' ? '🏢 Pro' : '🆓 Basic'}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                      <Settings className="w-3.5 h-3.5 mr-2" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/${pathname?.split('/')[1]}/${profile?.username}`, '_blank')}>
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      Voir profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-500">
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* 🔹 Actions rapides */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/admin/admin/contact-requests'}
                  className="h-9 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <Badge className="ml-1 bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] py-0.5 px-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://docs.luvika.com', '_blank')}
                  className="h-9 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Aide
                </Button>
              </div>
            </div>
          ) : (
            // 🔹 Version réduite
            <div className="flex flex-col items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    {loading ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                    ) : profile?.avatar_url && !avatarError ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        onError={handleAvatarError}
                        className="w-full h-full rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {(profile?.full_name || user?.email)?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 mt-1">
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-500">
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {unreadCount > 0 && (
                <Badge className="absolute bottom-14 bg-amber-500 text-black text-[10px] font-bold animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </div>
          )}
          
          {/* 🔹 Footer */}
          <div className={`mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-slate-500 transition-all duration-500`}>
            {!isSidebarCollapsed && (
              <>
                Fait à Kinshasa avec <span className="text-red-500">♥</span>
                <div className="mt-0.5 text-[10px] text-cyan-400/70">v2.1.0</div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 🔹 Bouton collapse flottant (version mobile) */}
<AnimatePresence>
  {isSidebarCollapsed && (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={toggleSidebar}
      className={`
        fixed top-1/2 z-40 w-10 h-10 flex items-center justify-center
        bg-gradient-to-r from-cyan-600 to-blue-700 border border-cyan-400/30
        backdrop-blur-xl rounded-full shadow-xl shadow-cyan-500/30
        text-white hover:shadow-cyan-400/50 hover:from-cyan-500 hover:to-blue-600
        transition-all duration-300 transform -translate-y-1/2 left-4
        hover:scale-110 active:scale-95
      `}
      aria-label="Développer le menu"
    >
      <ChevronRight className="w-5 h-5" />
    </motion.button>
  )}
</AnimatePresence>

{/* 🔹 AJOUTEZ LE NOUVEAU BOUTON ICI (juste après) */}
<AnimatePresence>
  {!isSidebarCollapsed && (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={toggleSidebar}
      className={`
        fixed top-16 left-4 z-40 md:hidden
        w-10 h-10 flex items-center justify-center
        bg-gradient-to-r from-cyan-600 to-blue-700 border border-cyan-400/30
        backdrop-blur-xl rounded-full shadow-xl shadow-cyan-500/30
        text-white hover:shadow-cyan-400/50 hover:from-cyan-500 hover:to-blue-600
        transition-all duration-300
        hover:scale-110 active:scale-95
        animate-pulse
      `}
      aria-label="Réduire le menu pour voir le contenu"
    >
      <ChevronLeft className="w-5 h-5" />
    </motion.button>
  )}
</AnimatePresence>

      {/* 🔹 Aide contextuelle (version desktop) */}
      {showHelp && !isSidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            fixed bottom-6 right-6 z-50 flex items-center gap-3
            bg-gradient-to-r from-slate-800/90 to-slate-900/90 
            backdrop-blur-xl border border-white/10 rounded-2xl
            px-4 py-3 shadow-2xl shadow-black/40
            animate-float
          `}
        >
          <div className="flex items-center gap-2 text-cyan-300">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium text-white">Besoin d'aide ?</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://docs.luvika.com', '_blank')}
            className="h-8 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
          >
            Documentation
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(false)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      <style jsx global>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 30s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}

// 🔹 Icônes manquantes (à ajouter en haut si nécessaire)
import { Eye, Shield } from 'lucide-react';