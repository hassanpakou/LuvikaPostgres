'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { GoogleAnalyticsCard } from '../../../../../src/components/admin/GoogleAnalyticsCard';
import {
  ArrowLeft,
  Users,
  Scan,
  Package,
  CreditCard,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// 🔹 Enregistrement Chart.js SANS TimeScale (évite l'erreur adapter)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// 🔹 Types pour les données
type Period = '7d' | '30d' | 'month' | 'year' | 'all';
type ChartPeriod = 'day' | 'week' | 'month' | 'year';

type AnalyticsStats = {
  total_users: number;
  total_scans: number;
  total_orders: number;
  total_nfc_cards: number;
  total_shops: number;
  scans_last_7d: number;
  pending_orders: number;
  active_nfc_cards: number;
};

type ScanData = {
  period_label: string;
  scan_count: number;
  unique_users: number;
};

type OrderStatus = {
  status: string;
  count: number;
  total_value: number;
};

type ActivityItem = {
  id: string;
  event_type: string;
  description: string;
  user_name: string | null;
  created_at: string;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [scansData, setScansData] = useState<ScanData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrderStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});
  
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Couleurs cohérentes avec le thème LUVIKA
  const COLORS = {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#a78bfa',
    cyan: '#22d3ee',
  };

  // 🔹 Récupération des données avec gestion d'erreurs robuste
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user || user.user_metadata?.role !== 'admin') {
        toast.error('accès refusé');
        router.push('/auth/sign-in');
        return;
      }

      // 🔹 Récupérer les stats avec période sélectionnée - CORRECTION TYPE
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_analytics_stats', { 
          p_period: period,
          p_start_date: customRange.start ? new Date(customRange.start) : null,
          p_end_date: customRange.end ? new Date(customRange.end) : null,
        })
        .single();

      if (statsError) throw statsError;
      // ✅ CORRECTION CRITIQUE : Assertion de type explicite
      setStats(statsData as unknown as AnalyticsStats);

      // 🔹 Scans par période - CORRECTION TYPE
      const { data: scans, error: scansError } = await supabase
        .rpc('get_scans_by_period', { 
          p_period: chartPeriod,
          p_limit: chartPeriod === 'year' ? 12 : chartPeriod === 'month' ? 30 : 60 
        });

      if (scansError) throw scansError;
      setScansData((scans || []) as ScanData[]);

      // 🔹 Commandes par statut - CORRECTION TYPE
      const { data: orders, error: ordersError } = await supabase.rpc('get_orders_by_status');
      if (ordersError) throw ordersError;
      setOrdersByStatus((orders || []) as OrderStatus[]);

      // 🔹 Activité récente - CORRECTION TYPE
      const { data: activity, error: activityError } = await supabase.rpc('get_recent_activity', { limit_count: 15 });
      if (activityError) throw activityError;
      setRecentActivity((activity || []) as ActivityItem[]);

    } catch (error: any) {
      console.error('❌ ERREUR DÉTAILLÉE CHARGEMENT ANALYTICS:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        status: error?.status,
      });
      
      if (error?.message?.includes('function') && error?.message?.includes('does not exist')) {
        toast.error('⚠️ Fonctions analytics non configurées', {
          description: 'Contactez l\'administrateur système pour installer les fonctions RPC manquantes',
          duration: 10000,
        });
      } else {
        toast.error('❌ Impossible de charger les statistiques', {
          description: error?.message || 'Erreur inconnue - Vérifiez la console',
          duration: 8000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [period, chartPeriod, customRange]);

  // 🔹 Données pour le graphique des scans - CORRECTION FORMATS
  const scansChartData = useMemo(() => {
    if (!scansData.length) return { labels: [], datasets: [] };
    
    const sorted = [...scansData].sort((a, b) => 
      new Date(a.period_label).getTime() - new Date(b.period_label).getTime()
    );
    
    return {
      labels: sorted.map(s => {
        if (chartPeriod === 'day') return format(new Date(s.period_label), 'dd MMM', { locale: fr });
        if (chartPeriod === 'week') return `Sem. ${s.period_label.split('-')[1]}`;
        if (chartPeriod === 'month') return format(new Date(`${s.period_label}-01`), 'MMM yyyy', { locale: fr });
        return s.period_label;
      }),
      datasets: [
        {
          label: 'Scans totaux',
          data: sorted.map(s => s.scan_count),
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Utilisateurs uniques',
          data: sorted.map(s => s.unique_users),
          borderColor: COLORS.success,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
          pointRadius: 3,
        }
      ],
    };
  }, [scansData, chartPeriod, COLORS]);

  // 🔹 Données pour le graphique des commandes
  const ordersChartData = useMemo(() => {
    if (!ordersByStatus.length) return { labels: [], datasets: [] };
    
    const statusLabels = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    
    return {
      labels: ordersByStatus.map(o => statusLabels[o.status as keyof typeof statusLabels] || o.status),
      datasets: [{
        data: ordersByStatus.map(o => o.count),
        backgroundColor: [
          COLORS.warning,
          COLORS.info,
          COLORS.cyan,
          COLORS.success,
          COLORS.danger,
        ],
        borderWidth: 0,
        hoverOffset: 15,
      }]
    };
  }, [ordersByStatus, COLORS]);

  // 🔹 Options Chart.js SANS TimeScale
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          padding: 20,
          font: { size: 12 },
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(56, 189, 248, 0.5)',
        borderWidth: 1,
        padding: 12,
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#94a3b8', precision: 0 },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      }
    }
  };

  // ✅ OPTIONS SÉCURISÉES SANS ADAPTER DE DATE
  const lineChartOptions = {
    ...chartOptions,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        ...chartOptions.scales.x,
        type: 'category' as const, // ✅ ÉVITE COMPLÈTEMENT LE PROBLÈME D'ADAPTER
        grid: { display: false },
      },
      y: chartOptions.scales.y
    }
  };

  // 🔹 Génération du rapport CSV
  const exportCSV = () => {
    if (!stats || !scansData.length) return;
    
    const headers = ['Période', 'Scans totaux', 'Utilisateurs uniques'];
    const rows = scansData.map(s => [s.period_label, s.scan_count, s.unique_users]);
    const csvContent = [
      ['Statistiques LUVIKA - Export du', new Date().toLocaleString('fr-FR')],
      [],
      ['Total utilisateurs:', stats.total_users.toString()],
      ['Total scans:', stats.total_scans.toString()],
      ['Total commandes:', stats.total_orders.toString()],
      ['Total cartes NFC:', stats.total_nfc_cards.toString()],
      ['Total boutiques:', stats.total_shops.toString()],
      [],
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `luvika-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // 🔹 FORMATTING SÉCURISÉ AVEC DATE-FNS (pas de luxon)
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatDateTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      locale: fr, 
      addSuffix: true 
    }) || 'à l\'instant';
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-12 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
                </div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-xl opacity-40 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full bg-slate-950"></div>
                <BarChart3 className="absolute inset-0 m-auto w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                Chargement des statistiques...
              </h3>
              <p className="text-gray-400 mb-6">
                Analyse des données en temps réel • Mise à jour toutes les 30 secondes
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* 🔹 Header avec navigation et filtres */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('admin.nav.back_to_dashboard')}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Tableau de bord analytique
          </h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble des performances • Mise à jour en temps réel
          </p>
        </div>
        
        {/* 🔹 Barre de filtres */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            {(['7d', '30d', 'month', 'year', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setCustomRange({});
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {p === '7d' && '7 jours'}
                {p === '30d' && '30 jours'}
                {p === 'month' && 'Mois'}
                {p === 'year' && 'Année'}
                {p === 'all' && 'Tout'}
              </button>
            ))}
          </div>
          
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:from-emerald-400 hover:to-cyan-500 transition shadow-lg shadow-emerald-500/20"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* 🔹 Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Users, label: 'Utilisateurs', value: stats?.total_users || 0, color: 'cyan' },
          { icon: Scan, label: 'Scans totaux', value: stats?.total_scans || 0, color: 'blue' },
          { icon: Package, label: 'Commandes', value: stats?.total_orders || 0, color: 'purple' },
          { icon: CreditCard, label: 'Cartes NFC', value: stats?.total_nfc_cards || 0, color: 'amber' },
          { icon: BarChart3, label: 'Boutiques', value: stats?.total_shops || 0, color: 'emerald' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={i} 
              className={`glass-border border-l-4 border-l-${stat.color}-500/50 bg-white/5 hover:bg-white/10 transition-all duration-300`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 text-${stat.color}-400`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  {stat.value.toLocaleString('fr-FR')}
                </div>
                {i === 1 && stats?.scans_last_7d && (
                  <p className="text-xs text-cyan-300 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stats.scans_last_7d.toLocaleString('fr-FR')} scans cette semaine
                  </p>
                )}
                {i === 2 && stats?.pending_orders && (
                  <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.pending_orders} en attente
                  </p>
                )}
                {i === 3 && stats?.active_nfc_cards && (
                  <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {stats.active_nfc_cards} actives
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🔹 Graphiques et activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 🔹 Graphique des scans */}
        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Activité des scans
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Évolution des scans et utilisateurs uniques
              </p>
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
              {(['day', 'week', 'month', 'year'] as ChartPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    chartPeriod === p
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {p === 'day' && 'Jour'}
                  {p === 'week' && 'Semaine'}
                  {p === 'month' && 'Mois'}
                  {p === 'year' && 'Année'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            {scansData.length > 0 && scansChartData.datasets[0]?.data?.length > 0 ? (
              <Line 
                data={scansChartData} 
                options={lineChartOptions} 
                plugins={[]} // ✅ ÉVITE LES CONFLITS DE PLUGIN
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée de scan pour la période sélectionnée</p>
                <button 
                  onClick={fetchAnalytics}
                  className="mt-3 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Actualiser
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🔹 Répartition des commandes */}
        <Card className="glass-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Commandes par statut
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Répartition actuelle des commandes
            </p>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            {ordersByStatus.length > 0 ? (
              <Doughnut data={ordersChartData} options={chartOptions} />
            ) : (
              <div className="text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune commande enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
{/* 🔹 Google Analytics (nouvelle section) */}
<GoogleAnalyticsCard />


      {/* 🔹 Activité récente */}
      <Card className="glass-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Activité récente
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Événements des 30 derniers jours
            </p>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Mise à jour : {format(new Date(), 'dd MMM yyyy HH:mm', { locale: fr })}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Événement</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.event_type === 'order' ? 'bg-purple-500/20 text-purple-300' :
                        item.event_type === 'scan' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.event_type === 'order' && <Package className="w-3 h-3 mr-1" />}
                        {item.event_type === 'scan' && <Scan className="w-3 h-3 mr-1" />}
                        {item.event_type === 'user' && <Users className="w-3 h-3 mr-1" />}
                        {item.event_type}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-white">{item.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-300">{item.user_name || 'Anonyme'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(item.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Activity className="w-12 h-12 mb-3 opacity-50" />
                        <p>Aucune activité récente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}