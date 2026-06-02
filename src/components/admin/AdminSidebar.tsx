// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, Users, Crown, CreditCard, ShoppingCart, 
  FileText, MessageSquare, Sparkle, LogOut,
  ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

// ✅ BONS CHEMINS (avec double admin comme l'ancien code)
const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Utilisateurs', icon: Users, href: '/admin/admin/users' },
  { name: 'Abonnements', icon: Crown, href: '/admin/admin/subscriptions' },
  { name: 'Commandes', icon: ShoppingCart, href: '/admin/admin/orders' },
  { name: 'Cartes NFC', icon: CreditCard, href: '/admin/admin/nfc' },
  { name: 'Événements', icon: FileText, href: '/admin/admin/events' },
  { name: 'Messages', icon: MessageSquare, href: '/admin/admin/contact-requests' },
  { name: 'Analytics', icon: Sparkle, href: '/admin/admin/analytics' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan')
          .eq('id', authUser.id)
          .single();
        if (profileData) setProfile(profileData);

        const { count } = await supabase
          .from('contact_requests')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);
        setUnreadCount(count || 0);
      }
    };
    fetchData();

    const supabase = createClient();
    const channel = supabase
      .channel('contact-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, async () => {
        const { count } = await supabase
          .from('contact_requests')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);
        setUnreadCount(count || 0);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Déconnexion réussie');
    window.location.href = '/auth/sign-in';
  };

  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen z-40 bg-slate-950/90 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'} flex flex-col`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500/60 to-blue-500/60 flex items-center justify-center flex-shrink-0">
              <Sparkle className="w-3.5 h-3.5 text-white/80" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white/80">LUVIKA</span>
                <span className="text-[10px] text-cyan-400/50 font-light">Admin</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 text-gray-400/50 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="space-y-0.5 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-light transition-colors ${
                    isActive
                      ? 'bg-white/[0.06] text-white/80'
                      : 'text-gray-400/60 hover:text-white/70 hover:bg-white/[0.03]'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {!collapsed && item.name === 'Messages' && unreadCount > 0 && (
                    <Badge className="bg-amber-500/10 text-amber-300/60 border-amber-500/20 text-[10px] font-light px-1.5 py-0">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.06] p-2">
          {collapsed ? (
            <div className="flex justify-center">
              <button onClick={handleSignOut} className="p-2 text-gray-400/50 hover:text-red-400/60 rounded-lg hover:bg-red-500/[0.04] transition-colors" title="Déconnexion">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500/40 to-blue-500/40 flex items-center justify-center text-white/70 text-xs font-medium flex-shrink-0">
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 font-medium truncate">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-[10px] text-gray-500/60 font-light">
                    {profile?.plan === 'premium' ? 'Premium' : profile?.plan === 'entreprise' ? 'Entreprise' : 'Basic'}
                  </p>
                </div>
                <button onClick={handleSignOut} className="p-1 text-gray-400/50 hover:text-red-400/60 rounded-lg transition-colors" title="Déconnexion">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-3 py-2 border-t border-white/[0.04] text-center text-[10px] text-gray-500/40 font-light">
            Fait à Kinshasa • v2.1.0
          </div>
        )}
      </aside>
    </>
  );
}