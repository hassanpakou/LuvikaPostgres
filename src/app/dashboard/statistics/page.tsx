// src/app/dashboard/statistics/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Users, Eye, Calendar, Download, RefreshCw,
  ChevronRight, Filter, Search, QrCode, Smartphone, Zap, Star, Shield, ArrowLeft,
  Lock, Crown, AlertCircle, Package, LinkIcon, BarChart2, LineChart, PieChart,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/src/lib/supabase/client';
import { motion } from 'framer-motion';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// 🔹 Enregistrement Chart.js
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
type Profile = { full_name?: string; username?: string };

// Types
type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: Profile[]; // ⚠️ C’est un tableau
};

type AnalyticsData = {
  total: number;
  byType: { type: string; count: number }[];
  byDay: { date: string; count: number }[];
  recent: Scan[];
};

export default function StatisticsPage() {
  const t = useTranslations('dashboard.statistics');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState<string>('basic');

  // 🔹 Vérifier le plan de l'utilisateur au chargement
  useEffect(() => {
    const checkUserPlan = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Récupérer le plan de l'utilisateur depuis Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      const plan = profile?.plan || 'basic';
      setUserPlan(plan);
      
      // 🔹 Seuls premium et entreprise ont accès complet
      const access = plan === 'premium' || plan === 'entreprise';
      setHasAccess(access);
      
      if (access) {
        await fetchAnalytics();
      }
      
      setLoading(false);
    };

    checkUserPlan();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🔹 Calculer la date de début selon la plage sélectionnée
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate = new Date('2020-01-01'); // Tout le temps
      }

      // 🔹 Récupérer les scans avec filtres
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select(`
          id,
          scan_type,
          created_at,
          profiles!inner(full_name, username)
        `)
        .eq('profile_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (scansError) throw scansError;

      // 🔹 Préparer les données agrégées
      const total = scans.length;
      
      // 🔹 Répartition par type
      const byType = ['nfc', 'qr_profile', 'qr_event'].map(type => ({
        type,
        count: scans.filter(s => s.scan_type === type).length
      }));

      // 🔹 Agrégation par jour
      const byDayMap = new Map<string, number>();
      scans.forEach(scan => {
        const date = new Date(scan.created_at).toLocaleDateString('fr-FR');
        byDayMap.set(date, (byDayMap.get(date) || 0) + 1);
      });

      const byDay = Array.from(byDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 14); // 14 derniers jours max

      setData({
        total,
        byType,
        byDay,
        recent: scans.slice(0, 10) // 10 derniers scans
      });
    } catch (error: any) {
      console.error('❌ ERREUR CHARGEMENT ANALYTICS:', error);
      toast.error('❌ Impossible de charger les statistiques', {
        description: error.message || 'Vérifiez votre connexion',
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchAnalytics();
    }
  }, [dateRange, hasAccess]);

  const handleRefresh = () => {
    if (!hasAccess) return;
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleExport = async () => {
    if (!hasAccess) return;
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: scans } = await supabase
        .from('scans')
        .select(`
          created_at,
          scan_type,
          ip_anonymized,
          profiles!inner(full_name, username)
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (!scans || scans.length === 0) {
        toast.warning('Aucun scan à exporter');
        return;
      }

      // 🔹 Générer CSV
      const headers = ['Date', 'Type', 'IP Anonymisée', 'Visiteur'];
      const rows = scans.map(scan => {
        const profile = Array.isArray(scan.profiles) ? scan.profiles[0] : scan.profiles;
        return [
          new Date(scan.created_at).toLocaleString('fr-FR'),
          scan.scan_type === 'nfc' ? 'NFC' : 
          scan.scan_type === 'qr_profile' ? 'QR Profil' : 'QR Business',
          scan.ip_anonymized || '—',
          profile?.full_name || profile?.username || 'Anonyme',
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-statistiques-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast.success('✅ Export CSV téléchargé !');
    } catch (err) {
      console.error('Erreur export:', err);
      toast.error('❌ Échec de l\'export');
    }
  };

  const filteredScans = useMemo(() => {
  if (!data?.recent) return [];

  return data.recent.filter(scan => {
    const profile = Array.isArray(scan.profiles) ? scan.profiles[0] : scan.profiles;

    const matchesSearch = !searchQuery || (
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesType = !filterType || scan.scan_type === filterType;

    return matchesSearch && matchesType;
  });
}, [data?.recent, searchQuery, filterType]);


  // 🔹 Helpers UI
  const formatDistance = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays}j`;
    if (diffHrs > 0) return `${diffHrs}h`;
    return `${diffMin}min`;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'nfc': return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'qr_profile': return <QrCode className="w-4 h-4 text-cyan-400" />;
      case 'qr_event': return <LinkIcon className="w-4 h-4 text-emerald-400" />;
      default: return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nfc': return 'NFC';
      case 'qr_profile': return 'QR Profil';
      case 'qr_event': return 'QR Lien';
      default: return 'Autre';
    }
  };

  const getCountByType = (type: string) => {
    return (data?.byType || []).find(t => t.type === type)?.count || 0;
  };

  // 🔹 Données pour les graphiques
  const scanChartData = useMemo(() => {
    if (!data?.byDay.length) return { labels: [], datasets: [] };
    
    return {
      labels: data.byDay.map(d => d.date),
      datasets: [
        {
          label: 'Scans par jour',
          data: data.byDay.map(d => d.count),
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        }
      ]
    };
  }, [data?.byDay]);

  const typeChartData = useMemo(() => {
    if (!data?.byType.length) return { labels: [], datasets: [] };
    
    return {
      labels: data.byType.map(t => getTypeLabel(t.type)),
      datasets: [{
        data: data.byType.map(t => t.count),
        backgroundColor: [
          'rgba(245, 158, 11, 0.7)',    // NFC - amber
          'rgba(56, 189, 248, 0.7)',    // QR Profil - cyan
          'rgba(16, 185, 129, 0.7)',    // QR Lien - emerald
        ],
        borderWidth: 0,
        hoverOffset: 15,
      }]
    };
  }, [data?.byType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          padding: 15,
          font: { size: 11 },
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
        ticks: { color: '#94a3b8', maxRotation: 0, minRotation: 0 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#94a3b8', precision: 0 },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      }
    }
  };

  // 🔹 AFFICHAGE CHARGEMENT
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-cyan-400/30 animate-spin-slow"></div>
            <BarChart3 className="absolute inset-0 m-auto w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
            Chargement de vos statistiques...
          </h3>
          <p className="text-gray-400">Analyse des données en cours</p>
        </div>
      </div>
    );
  }

  // 🔹 AFFICHAGE ACCÈS BLOQUÉ (plan basic)
  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-cyan-400" />
                {t('title')}
              </h1>
              <p className="text-gray-400">{t('subtitle')}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </motion.div>

          {/* 🔒 MESSAGE DE BLOCAGE */}
          <Card className="glass-border border-amber-500/20 bg-amber-900/10">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="space-y-3 max-w-2xl">
                  <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
                    Statistiques Premium
                  </h2>
                  <p className="text-lg text-gray-300">
                    Accédez à vos statistiques détaillées, graphiques interactifs et analyses avancées
                  </p>
                  <p className="text-gray-400">
                    Cette fonctionnalité est réservée aux utilisateurs des plans <span className="font-bold text-cyan-300">Premium</span> et <span className="font-bold text-emerald-300">Entreprise</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-6">
                  {/* Plan Basic */}
                  <div className="glass-border p-5 rounded-2xl bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white">Votre plan actuel</div>
                          <div className="text-sm text-gray-400">Basic</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                        Gratuit
                      </Badge>
                    </div>
                    <div className="space-y-2 text-left text-gray-400 text-sm">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Statistiques détaillées</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Graphiques interactifs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Export CSV</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Scan de base</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Premium */}
                  <div className="glass-border p-5 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div>
                          <div className="font-bold text-white">Premium</div>
                          <div className="text-sm text-cyan-300">Recommandé</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        9€/mois
                      </Badge>
                    </div>
                    <div className="space-y-2 text-left text-gray-300 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Statistiques complètes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Graphiques interactifs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Export CSV illimité</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Analytics en temps réel</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/dashboard/pricing')}
                  className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-cyan-500/20"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Passer au plan Premium
                </Button>
                
                <p className="text-xs text-gray-500 mt-4">
                  Vous avez déjà un plan supérieur ?{' '}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    Actualiser la page
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 🔹 AFFICHAGE NORMAL (premium/entreprise)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-cyan-400" />
              {t('title')}
            </h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
            <Button 
              onClick={handleExport}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </motion.div>

        {/* Filtres */}
        <Card className="glass-border mb-8">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Label className="text-gray-300">{t('range')}</Label>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-white/5 border-white/20">
                  <SelectValue placeholder={t('range')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="7d">{t('last_7_days')}</SelectItem>
                  <SelectItem value="30d">{t('last_30_days')}</SelectItem>
                  <SelectItem value="90d">{t('last_90_days')}</SelectItem>
                  <SelectItem value="all">{t('all_time')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 flex gap-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Label className="text-gray-300">{t('search')}</Label>
              </div>
              <Input
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex-1 flex gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <Label className="text-gray-300">{t('filter_type')}</Label>
              </div>
              <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? null : v)}>
                <SelectTrigger className="w-40 bg-white/5 border-white/20">
                  <SelectValue placeholder={t('all_types')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="all">{t('all_types')}</SelectItem>
                  <SelectItem value="nfc">NFC</SelectItem>
                  <SelectItem value="qr_profile">QR Profil</SelectItem>
                  <SelectItem value="qr_event">QR Lien</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">{t('total_scans')}</p>
                  <p className="text-3xl font-bold text-white mt-1">{data?.total || 0}</p>
                </div>
                <div className="p-3 bg-cyan-500/15 rounded-xl">
                  <BarChart2 className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-cyan-400">
                <TrendingUp className="w-4 h-4" />
                <span>+{Math.round((data?.total || 0) * 0.15)} cette période</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Scans NFC</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">{getCountByType('nfc')}</p>
                </div>
                <div className="p-3 bg-amber-500/15 rounded-xl">
                  <Smartphone className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {Math.round((getCountByType('nfc') / (data?.total || 1)) * 100)}% du total
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">QR Profil</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-1">{getCountByType('qr_profile')}</p>
                </div>
                <div className="p-3 bg-cyan-500/15 rounded-xl">
                  <QrCode className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {Math.round((getCountByType('qr_profile') / (data?.total || 1)) * 100)}% du total
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">QR Lien</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">{getCountByType('qr_event')}</p>
                </div>
                <div className="p-3 bg-emerald-500/15 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {Math.round((getCountByType('qr_event') / (data?.total || 1)) * 100)}% du total
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 🔹 Graphique des tendances */}
          <Card className="glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LineChart className="text-cyan-400" />
                Évolution des scans ({dateRange === '7d' ? '7 derniers jours' : dateRange === '30d' ? '30 derniers jours' : '90 derniers jours'})
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {data?.byDay.length ? (
                <Line data={scanChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                  <p>Aucune donnée pour la période sélectionnée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🔹 Répartition par type */}
          <Card className="glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="text-amber-400" />
                Répartition par type de scan
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex flex-col items-center justify-center">
              {data?.byType.length ? (
                <Doughnut data={typeChartData} options={chartOptions} />
              ) : (
                <div className="text-center text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun scan enregistré</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Derniers scans */}
        <Card className="glass-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="text-emerald-400" />
              Derniers scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredScans.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Aucun scan correspondant aux filtres
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">Visiteur</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            {getIconForType(scan.scan_type)}
                            {getTypeLabel(scan.scan_type)}
                          </div>
                        </td>
                       <td className="py-3 px-4">
  <div className="text-sm text-white">
    {scan.profiles?.[0]?.full_name || scan.profiles?.[0]?.username || 'Anonyme'}
  </div>
</td>


                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDistance(scan.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}