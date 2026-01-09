// src/app/dashboard/entreprise/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    companyId: '' // 🔹 Ajouté pour les canaux realtime
  });

  const modules: Module[] = [
    {
      id: 'dashboard',
      title: t('modules.dashboard.title'),
      description: t('modules.dashboard.desc'),
      icon: <LayoutDashboard className="w-6 h-6" />,
      color: 'bg-blue-500/20 text-blue-400',
      path: '/dashboard/entreprise'
    },
    {
      id: 'shop',
      title: t('modules.shop.title'),
      description: t('modules.shop.desc'),
      icon: <Store className="w-6 h-6" />,
      color: 'bg-emerald-500/20 text-emerald-400',
      path: '/dashboard/entreprise/shop'
    },
    {
      id: 'orders',
      title: t('modules.orders.title'),
      description: t('modules.orders.desc'),
      icon: <Package className="w-6 h-6" />,
      color: 'bg-amber-500/20 text-amber-400',
      path: '/dashboard/entreprise/orders'
    },
    {
      id: 'employees',
      title: t('modules.employees.title'),
      description: t('modules.employees.desc'),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-cyan-500/20 text-cyan-400',
      path: '/dashboard/entreprise/employees'
    },
    {
      id: 'cards',
      title: t('modules.cards.title'),
      description: t('modules.cards.desc'),
      icon: <IdCard className="w-6 h-6" />,
      color: 'bg-violet-500/20 text-violet-400',
      path: '/dashboard/entreprise/cards'
    },
    {
      id: 'attendance',
      title: t('modules.attendance.title'),
      description: t('modules.attendance.desc'),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500/20 text-green-400',
      path: '/dashboard/entreprise/attendance'
    },
    {
      id: 'communication',
      title: t('modules.communication.title'),
      description: t('modules.communication.desc'),
      icon: <Megaphone className="w-6 h-6" />,
      color: 'bg-rose-500/20 text-rose-400',
      path: '/dashboard/entreprise/communication'
    },
    {
      id: 'settings',
      title: t('modules.settings.title'),
      description: t('modules.settings.desc'),
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500/20 text-gray-400',
      path: '/dashboard/entreprise/settings'
    }
  ];

  // 🔹 Fonction de chargement initial + mise à jour
  const fetchAndUpdateStats = async (companyId: string, userId: string) => {
    try {
      const [{ data: orders }, { data: employees }, {  data: cards }] = await Promise.all([
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
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      // 🔹 🔒 VÉRIFICATION SÉCURITÉ : plan entreprise requis
      const { data : profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profile?.plan !== 'entreprise') {
        console.warn('⚠️ Accès refusé au dashboard entreprise — plan incorrect');
        router.push('/dashboard'); // 🔙 Redirection vers le dashboard principal
        return;
      }

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

     if (!company) {
  console.error('❌ Aucune entreprise trouvée pour cet utilisateur');
  alert('Votre compte entreprise n’est pas encore configuré. Contactez le support.');
  router.push('/dashboard');
  return;
}

      userId = user.id;
      companyId = company.id;

      // ... reste du code inchangé
        // 🔹 Chargement initial
        await fetchAndUpdateStats(companyId, userId);

        // 🔹 🔁 REALTIME — Commandes
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
      playSound(); // 🔊 Son uniquement pour les nouvelles commandes
    }
  })
  .subscribe();

// 🔹 🔁 REALTIME — Employés
const employeesChannel = supabase
  .channel(`employees-${companyId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'employees',
    filter: `company_id=eq.${companyId}`
  }, () => fetchAndUpdateStats(companyId, userId))
  .subscribe();

// 🔹 🔁 REALTIME — Cartes
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
      } catch (err) {
        console.error('❌ Init échouée:', err);
        setLoading(false);
      }
    };

    init();

    // 🔹 Nettoyage des canaux au démontage
    return () => {
      realtimeChannels.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/30 mb-6">
          <Building className="w-8 h-8 text-indigo-300" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* 🔹 Statistiques clés — MAINTENANT EN TEMPS RÉEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-border text-center p-6">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-gray-400">Ventes totales</p>
          <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} $</p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-gray-400">Commandes en cours</p>
          <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-gray-400">Employés actifs</p>
          <p className="text-2xl font-bold text-white">{stats.activeEmployees}</p>
        </Card>
        <Card className="glass-border text-center p-6">
          <IdCard className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-gray-400">Cartes actives</p>
          <p className="text-2xl font-bold text-white">{stats.activeCards}</p>
        </Card>
      </div>

      {/* 🔹 Graphique d'activité */}
      {!loading && (
        <AnalyticsChart profileId={stats.profileId} />
      )}

      {/* Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="glass-border bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 backdrop-blur-xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(module.path)}
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <CardTitle className="text-white text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Valeur ajoutée */}
      <div className="mt-12 glass-border bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-8 h-8 text-indigo-400 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{t('value_prop.title')}</h3>
            <p className="text-gray-300">{t('value_prop.desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}