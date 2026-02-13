// src/app/dashboard/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Users, Eye, Calendar, Download, RefreshCw,
  ChevronRight, Filter, Search, Globe, QrCode, Smartphone, Zap, Star, Shield, ArrowLeft,
  Lock, Crown, AlertCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Types
type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: { full_name?: string; username?: string };
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
const [userPlan, setUserPlan] = useState<string>('freemium');
const LockedCard: React.FC<{ userPlan: string; children: React.ReactNode }> = ({ userPlan, children }) => {
  return (
    <div className="relative">
      {children}
      {userPlan === 'freemium' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center gap-2 text-white text-center">
            <Lock className="w-6 h-6" />
            <span className="text-sm">Disponible pour les plans Professionnel</span>
          </div>
        </div>
      )}
    </div>
  );
};

  // 🔹 Définir les actions DU MENU RAPIDE
  const quickActions = [
    {
      id: 'export',
      label: t('export'),
      icon: <Download className="w-4 h-4" />,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'refresh',
      label: t('refresh'),
      icon: <RefreshCw className="w-4 h-4" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'back',
      label: t('back'),
      icon: <ArrowLeft className="w-4 h-4" />,
      color: 'from-gray-500 to-gray-600',
    }
  ];

  // 🔹 Gestionnaire d'actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'export':
        handleExport();
        break;
      case 'refresh':
        handleRefresh();
        break;
      case 'back':
        router.push('/dashboard');
        break;
    }
  };

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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profiles?.plan || 'basic'; // Par défaut basic
    setUserPlan(plan);

    // 🔹 Seuls premium et entreprise ont accès
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

      const res = await fetch(`/api/analytics?profile_id=${user.id}&range=${dateRange}`);
      const result = await res.json();
      setData(result);
   } catch (error: any) {
  // 🔹 CORRECTION : Gestion d'erreur robuste avec détection d'erreur RPC
  const errorMessage = error?.message || 'Erreur inconnue';
  const isRpcError = errorMessage.includes('function') && errorMessage.includes('does not exist');
  
  console.error('❌ ERREUR CHARGEMENT ANALYTICS:', {
    type: error?.name || 'Unknown',
    message: errorMessage,
    status: error?.status,
    stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
    isRpcError
  });

  if (isRpcError) {
    toast.error('⚠️ Fonctions analytics non installées', {
      description: 'Les fonctions SQL sont manquantes dans la base de données. Contactez l\'administrateur système.',
      duration: 10000,
    });
  } else if (errorMessage.includes('ambiguous')) {
    toast.error('⚠️ Erreur de colonne ambiguë', {
      description: 'Une colonne "status" non qualifiée existe dans les fonctions SQL. Contactez le développeur.',
      duration: 10000,
    });
  } else {
    toast.error('❌ Impossible de charger les statistiques', {
      description: errorMessage || 'Vérifiez votre connexion et réessayez',
      duration: 8000,
    });
  }
} finally {
  setLoading(false);
}
    const supabase = createClient();
    
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

// Récupérer le plan depuis le metadata
const plan = user.user_metadata?.plan || 'freemium';
setUserPlan(plan);

  };

  useEffect(() => {
    if (hasAccess) {
      fetchAnalytics();
    }
  }, [dateRange, hasAccess]);

  const handleRefresh = async () => {
    if (!hasAccess) return;
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleExport = async () => {
    if (!hasAccess) return;
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/scans/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-scans-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('❌ Échec export');
    }
  };

  const filteredScans = data?.recent?.filter(scan => {
    const matchesSearch = !searchQuery ||
      (scan.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scan.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !filterType || scan.scan_type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const formatDistance = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays > 0) return `${diffDays} j`;
    if (diffHrs > 0) return `${diffHrs} h`;
    if (diffMin > 0) return `${diffMin} min`;
    return `${diffSec} s`;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'nfc': return <Smartphone className="w-4 h-4" />;
      case 'qr_profile': return <QrCode className="w-4 h-4" />;
      case 'qr_event': return <Globe className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nfc': return 'NFC';
      case 'qr_profile': return 'QR Profil';
      case 'qr_event': return 'QR Business';
      default: return type;
    }
  };

  const getCountByType = (type: string) => {
    return (data?.byType || []).find(t => t.type === type)?.count || 0;
  };

  // 🔹 AFFICHAGE SI CHARGEMENT
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 🔹 AFFICHAGE SI ACCÈS BLOQUÉ (plan freemium)
  if (hasAccess === false) {
    return (
      <div className="space-y-8 pb-24">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        </motion.div>

        {/* 🔒 MESSAGE DE BLOCAGE */}
        <Card className="glass-border border-red-500/30 bg-red-500/5">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <Lock className="w-12 h-12 text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  Accès restreint
                </h2>
                <p className="text-gray-400 max-w-2xl">
                  Les statistiques avancées sont réservées aux utilisateurs des plans <strong className="text-cyan-300">Professionnel</strong> et <strong className="text-emerald-300">Business</strong>.
                </p>
              </div>

              <div className="w-full max-w-md space-y-4">
                {/* Plan Freemium */}
                <div className="glass-border p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-300" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Votre plan actuel</div>
                        <div className="text-sm text-red-300">Freemium</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-500/30 text-red-300">
                      Actif
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    ✗ Statistiques avancées
                    <br />
                    ✗ Export CSV
                    <br />
                    ✗ Analytics en temps réel
                  </div>
                </div>

                {/* Plan Professionnel */}
                <div className="glass-border p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Professionnel</div>
                        <div className="text-sm text-cyan-300">Recommandé</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                      À partir de 9€/mois
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    ✓ Statistiques complètes
                    <br />
                    ✓ Export CSV illimité
                    <br />
                    ✓ Analytics en temps réel
                    <br />
                    ✓ 100+ fonctionnalités premium
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push('/dashboard/pricing')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Passer au plan Professionnel
              </Button>

              <p className="text-xs text-gray-500">
                Vous avez déjà un plan supérieur ? <button onClick={() => window.location.reload()} className="text-cyan-400 hover:underline">Actualiser</button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔹 AFFICHAGE NORMAL (si hasAccess === true)
  return (
    <div className="space-y-8 pb-24">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </motion.div>

      {/* Filtres */}
<Card className="glass-border">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('range')}</Label>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('range')} />
              </SelectTrigger>
              <SelectContent>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('filter_type')}</Label>
            </div>
            <Select value={filterType || 'all'} onValueChange={(v: string) => setFilterType(v === 'all' ? null : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('all_types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_types')}</SelectItem>
                <SelectItem value="nfc">NFC</SelectItem>
                <SelectItem value="qr_profile">QR Profil</SelectItem>
                <SelectItem value="qr_event">QR Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
<LockedCard userPlan={userPlan}> 
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{data?.total || 0}</div>
              <div className="text-sm text-gray-400">{t('total_scans')}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {getCountByType('nfc')}
              </div>
              <div className="text-sm text-gray-400">NFC</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {getCountByType('qr_profile')}
              </div>
              <div className="text-sm text-gray-400">QR Profil</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {getCountByType('qr_event')}
              </div>
              <div className="text-sm text-gray-400">QR Business</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des tendances */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400" />
            {t('trends')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.byDay?.map((day, i) => (
              <div key={i} className="flex items-center justify-between p-3 glass-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-400">{day.count} scans</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    +{Math.round((day.count / (data.total || 1)) * 100)}%
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Derniers scans */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="text-emerald-400" />
            {t('recent_scans')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t('no_scans')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScans.map(scan => (
                <div key={scan.id} className="flex items-center justify-between p-3 glass-border rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                      {getIconForType(scan.scan_type)}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {scan.profiles?.full_name || t('anonymous')}
                      </div>
                      <div className="text-sm text-gray-400">
                        @{scan.profiles?.username || 'inconnu'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(scan.scan_type)}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      {formatDistance(scan.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-yellow-400" />
            {t('insights')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 glass-border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">{t('unique_visitors')}</div>
                  <div className="text-sm text-gray-400">{t('unique_visitors_desc')}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-300">
                {new Set(data?.recent?.map(s => s.profiles?.username).filter(Boolean)).size}
              </div>
            </div>

            <div className="p-4 glass-border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">{t('best_day')}</div>
                  <div className="text-sm text-gray-400">{t('best_day_desc')}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {data?.byDay?.reduce((best, curr) => curr.count > (best?.count || 0) ? curr : best)?.date
                  ? new Date(data.byDay.reduce((best, curr) => curr.count > (best?.count || 0) ? curr : best).date).toLocaleDateString()
                  : '—'}
              </div>
            </div>

            <div className="p-4 glass-border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">{t('security')}</div>
                  <div className="text-sm text-gray-400">{t('security_desc')}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-300">🔒</div>
            </div>
          </div>
        </CardContent>
      </Card>
 </LockedCard>
      {/* 🔹 MENU FLOTTANT */}
      <DashboardQuickMenu 
        onAction={handleQuickAction} 
        actions={quickActions} 
      />
    </div>
  );
}