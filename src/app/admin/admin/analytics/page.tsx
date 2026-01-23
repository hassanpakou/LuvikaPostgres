'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  ArrowLeft,
  Users,
  Scan,
  Package,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// 🔹 Enregistre les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type StatData = {
  userCount: number;
  scanCount: number;
  orderCount: number;
  nfcCount: number;
  scansByDay: { day: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      try {
        // 🔹 Stats agrégées
        const [
          profilesRes,
          scansRes,
          ordersRes,
          nfcCardsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('scans').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('nfc_cards').select('*', { count: 'exact', head: true }),
        ]);

        const userCount = profilesRes.count ?? 0;
        const scanCount = scansRes.count ?? 0;
        const orderCount = ordersRes.count ?? 0;
        const nfcCount = nfcCardsRes.count ?? 0;

        // 🔹 Scans par jour (7 derniers jours)
        const { data : scansByDay } = await supabase.rpc('get_scans_by_day');

        // 🔹 Commandes par statut
        const { data : ordersByStatus } = await supabase.rpc('get_orders_by_status');

        setStats({
          userCount,
          scanCount,
          orderCount,
          nfcCount,
          scansByDay: scansByDay || [],
          ordersByStatus: ordersByStatus || [],
        });
      } catch (error) {
        console.error('Erreur analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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
          <h3 className="text-xl font-medium text-white mb-2">Chargement des statistiques...</h3>
          <p className="text-gray-400">Analyse des données en cours</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Impossible de charger les statistiques</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 📊 Données pour les graphiques
  const scanChartData = {
    labels: stats.scansByDay.map(s => s.day),
    datasets: [
      {
        label: 'Scans par jour',
        data: stats.scansByDay.map(s => s.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const orderStatusData = {
    labels: stats.ordersByStatus.map(o => 
      t(`admin.orders.status.${o.status}`) || o.status
    ),
    datasets: [
      {
        data: stats.ordersByStatus.map(o => o.count),
        backgroundColor: [
          'rgba(234, 179, 8, 0.6)', // pending
          'rgba(59, 130, 246, 0.6)', // processing
          'rgba(14, 165, 233, 0.6)', // shipped
          'rgba(16, 185, 129, 0.6)', // delivered
          'rgba(239, 68, 68, 0.6)',  // cancelled
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.nav.back_to_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-white">{t('admin.modules.analytics.title')}</h1>
        <p className="text-gray-400">{t('admin.modules.analytics.description')}</p>
      </div>

      {/* 🔢 Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.total_users')}</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.userCount}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.total_scans')}</CardTitle>
            <Scan className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.scanCount}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.orders')}</CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.orderCount}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.nfc_cards')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.nfcCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* 📈 Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-border">
          <CardHeader>
            <CardTitle className="text-xl text-white">Scans des 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Bar data={scanChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader>
            <CardTitle className="text-xl text-white">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Pie data={orderStatusData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      {/* 📊 Activité récente (placeholder) */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('admin.analytics.recent_activity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Prochainement : tableau d’activité en temps réel avec filtres avancés.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}