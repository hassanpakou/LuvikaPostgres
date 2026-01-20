// src/app/dashboard/entreprise/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  LayoutDashboard, Store, Package, Users, IdCard, Clock, Megaphone, Settings,
  TrendingUp, Building, ShoppingCart, UserCheck, QrCode, MessageSquare, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/src/lib/supabase/client';
import AnalyticsChart from '@/src/components/dashboard/AnalyticsChart';
import { useSoundNotification } from '@/src/hooks/useSoundNotification';

type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
};

export default function EnterpriseDashboard() {
  const t = useTranslations('enterprise');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const realtimeChannels = useRef<any[]>([]);
  const { playSound } = useSoundNotification();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    activeEmployees: 0,
    activeCards: 0,
    profileId: '',
    companyId: ''
  });

  const modules: Module[] = [
    {
      id: 'dashboard',
      title: t('modules.dashboard.title'),
      description: t('modules.dashboard.desc'),
      icon: <LayoutDashboard className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      path: '/dashboard/entreprise'
    },
    {
      id: 'shop',
      title: t('modules.shop.title'),
      description: t('modules.shop.desc'),
      icon: <Store className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      path: '/dashboard/entreprise/shop'
    },
    {
      id: 'orders',
      title: t('modules.orders.title'),
      description: t('modules.orders.desc'),
      icon: <Package className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      path: '/dashboard/entreprise/orders'
    },
    {
      id: 'employees',
      title: t('modules.employees.title'),
      description: t('modules.employees.desc'),
      icon: <Users className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      path: '/dashboard/entreprise/employees'
    },
    {
      id: 'cards',
      title: t('modules.cards.title'),
      description: t('modules.cards.desc'),
      icon: <IdCard className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-500',
      path: '/dashboard/entreprise/cards'
    },
    {
      id: 'attendance',
      title: t('modules.attendance.title'),
      description: t('modules.attendance.desc'),
      icon: <Clock className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      path: '/dashboard/entreprise/attendance'
    },
    {
      id: 'communication',
      title: t('modules.communication.title'),
      description: t('modules.communication.desc'),
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-rose-500 to-pink-500',
      path: '/dashboard/entreprise/communication'
    },
    {
      id: 'settings',
      title: t('modules.settings.title'),
      description: t('modules.settings.desc'),
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      path: '/dashboard/entreprise/settings'
    }
  ];

  const fetchAndUpdateStats = async (companyId: string, userId: string) => {
    try {
      const [{ data: orders }, { data: employees }, { data: cards }] = await Promise.all([
        supabase.from('orders').select('total_amount, status').eq('seller_id', companyId),
        supabase.from('employees').select('status').eq('company_id', companyId),
        supabase.from('cards').select('status').eq('company_id', companyId)
      ]);

      const totalRevenue = (orders || [])
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      const pendingOrders = (orders || []).filter((o: any) => o.status === 'pending').length;
      const activeEmployees = (employees || []).filter((e: any) => e.status === 'active').length;
      const activeCards = (cards || []).filter((c: any) => c.status === 'active').length;

      setStats({
        totalRevenue,
        pendingOrders,
        activeEmployees,
        activeCards,
        profileId: userId,
        companyId
      });
    } catch (err) {
      console.error('❌ Erreur chargement stats:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    let companyId = '';
    let userId = '';

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/sign-in');
          return;
        }

        setLoading(true);

        const [{ data: profile }, { data: company }] = await Promise.all([
          supabase.from('profiles').select('plan').eq('id', user.id).single(),
          supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle()
        ]);

        const plan = profile?.plan?.toLowerCase();
        const isEnterprisePlan = plan === 'entreprise';
        
        if (!company && !isEnterprisePlan) {
          router.push('/dashboard');
          return;
        }

        if (!company) {
          alert('Votre compte entreprise est en cours de configuration...');
          router.push('/dashboard');
          return;
        }

        userId = user.id;
        companyId = company.id;

        await fetchAndUpdateStats(companyId, userId);

        const ordersChannel = supabase
          .channel(`orders-${companyId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `seller_id=eq.${companyId}`
          }, (payload) => {
            fetchAndUpdateStats(companyId, userId);
            if (payload.eventType === 'INSERT') {
              playSound();
            }
          })
          .subscribe();

        const employeesChannel = supabase
          .channel(`employees-${companyId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'employees',
            filter: `company_id=eq.${companyId}`
          }, () => fetchAndUpdateStats(companyId, userId))
          .subscribe();

        const cardsChannel = supabase
          .channel(`cards-${companyId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `company_id=eq.${companyId}`
          }, () => fetchAndUpdateStats(companyId, userId))
          .subscribe();

        realtimeChannels.current = [ordersChannel, employeesChannel, cardsChannel];
      } catch (err: any) {
        console.error('❌ Init échouée (EnterpriseDashboard):', err);
        router.push('/dashboard');
      }
    };

    init();

    return () => {
      realtimeChannels.current.forEach(channel => {
        if (channel?.unsubscribe) channel.unsubscribe();
      });
    };
  }, []);

  // ✅ Loader élégant
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Chargement de votre espace entreprise...</h3>
          <p className="text-gray-400">Préparation de vos données en temps réel</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* 🔝 En-tête élégant */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 mb-6 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
          <Building className="w-10 h-10 text-indigo-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-200 via-cyan-200 to-purple-200 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-300 mt-4 max-w-3xl mx-auto text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* 📊 Statistiques clés — Design premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Ventes totales", 
            value: `${stats.totalRevenue.toLocaleString()} $`, 
            icon: <TrendingUp className="w-6 h-6" />, 
            color: "from-emerald-500 to-teal-500" 
          },
          { 
            title: "Commandes en cours", 
            value: stats.pendingOrders, 
            icon: <Package className="w-6 h-6" />, 
            color: "from-amber-500 to-orange-500" 
          },
          { 
            title: "Employés actifs", 
            value: stats.activeEmployees, 
            icon: <Users className="w-6 h-6" />, 
            color: "from-cyan-500 to-blue-500" 
          },
          { 
            title: "Cartes actives", 
            value: stats.activeCards, 
            icon: <IdCard className="w-6 h-6" />, 
            color: "from-violet-500 to-purple-500" 
          }
        ].map((stat, index) => (
          <Card 
            key={index}
            className="glass-border overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📈 Graphique d'activité */}
      {!loading && (
        <div className="glass-border bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <AnalyticsChart profileId={stats.profileId} />
        </div>
      )}

      {/* 🧩 Modules — Cartes interactives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="glass-border overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-white/5"
            onClick={() => router.push(module.path)}
          >
            <CardHeader className="pb-4 pt-6 px-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <CardTitle className="text-white text-lg font-semibold group-hover:text-cyan-300 transition-colors">
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 💎 Valeur ajoutée — Bannière premium */}
      <div className="mt-12 glass-border bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl p-8 rounded-3xl border border-indigo-500/30">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-3">{t('value_prop.title')}</h3>
            <p className="text-gray-200 max-w-2xl">{t('value_prop.desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}