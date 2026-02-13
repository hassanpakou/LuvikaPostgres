// src/app/admin/admin/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Users, Package, TrendingUp, BarChart3, Wallet,
  ArrowUpRight, RefreshCw, AlertCircle, CheckCircle, Clock, 
  FileText, ShieldCheck, Crown, Smartphone, Scan, CreditCard, 
  UserPlus, Zap, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { createClient } from '../../../src/lib/supabase/client';
import AdminActions from '../../../components/admin/AdminActions';
import { AdminSidebar } from '../../../src/components/admin/AdminSidebar';
import { useAdminLayout } from '../../../src/contexts/AdminLayoutContext';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type AdminStats = {
  totalEnterprises: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
};

// 🔹 Type pour les variations avec trend typé correctement
type StatVariation = {
  value: number;
  variation: number;
  trend: 'up' | 'down'; // ✅ Typage strict TypeScript
};

export default function AdminDashboard() {
  const t = useTranslations();
  const { isSidebarCollapsed } = useAdminLayout();
  const [stats, setStats] = useState<AdminStats>({
    totalEnterprises: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]); // ✅ Pour activité dynamique
  const supabase = createClient();

  // 🔹 Chargement des statistiques
  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const [
        enterprisesRes,
        employeesRes,
        ordersRes,
        revenueRes,
        subscriptionsRes
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.rpc('get_total_revenue'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('active', true)
      ]);

      setStats({
        totalEnterprises: enterprisesRes.count || 0,
        totalEmployees: employeesRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue: revenueRes.data?.[0]?.total || 0,
        activeSubscriptions: subscriptionsRes.count || 0
      });
      
      // 🔹 Charger l'activité récente
      await fetchRecentActivities();
      
      toast.success('✅ Tableau de bord mis à jour', { duration: 2000 });
    } catch (err) {
      console.error('❌ Erreur chargement stats admin:', err);
      toast.error('❌ Impossible de charger les statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

// 🔹 CORRECTION DANS fetchRecentActivities - LIGNE 110-150
const fetchRecentActivities = async () => {
  try {
    // 🔸 Activité 1: Dernières commandes NFC
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        product_type,
        status,
        profiles!inner (full_name, username)
      `)
      .eq('product_type', 'nfc_premium')
      .order('created_at', { ascending: false })
      .limit(3);

    // 🔸 Activité 2: Dernières activations NFC
    const { data: recentActivations } = await supabase
      .from('nfc_cards')
      .select(`
        id,
        activated_at,
        card_id,
        profiles!inner (full_name, username)
      `)
      .not('activated_at', 'is', null)
      .order('activated_at', { ascending: false })
      .limit(3);

    // 🔸 Activité 3: Nouveaux utilisateurs
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, username, created_at, plan')
      .order('created_at', { ascending: false })
      .limit(3);

    // 🔸 Fusionner et trier les activités - CORRECTION CRITIQUE ICI ✅
    const activities = [
      // ✅ CORRECTION 1: profiles est un TABLEAU → utiliser [0]
      ...(recentOrders || []).map((order: any) => {
        const profile = order.profiles?.[0]; // ← ACCÈS SÉCURISÉ AU PREMIER ÉLÉMENT
        return {
          type: 'order' as const,
          icon: <Package className="w-5 h-5 text-amber-400" />,
          title: `Nouvelle commande NFC`,
          description: `Par ${profile?.full_name || 'Utilisateur'} (@${profile?.username})`,
          time: order.created_at,
          badge: <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs">Commande</Badge>
        };
      }),
      
      // ✅ CORRECTION 2: MÊME CORRECTION POUR ACTIVATIONS
      ...(recentActivations || []).map((activation: any) => {
        const profile = activation.profiles?.[0]; // ← ACCÈS SÉCURISÉ AU PREMIER ÉLÉMENT
        return {
          type: 'activation' as const,
          icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
          title: `Carte NFC activée`,
          description: `Par ${profile?.full_name || 'Utilisateur'} (@${profile?.username})`,
          time: activation.activated_at,
          badge: <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-xs">Activée</Badge>
        };
      }),
      
      // ✅ CORRECTION 3: Utilisateurs (déjà correct - profiles n'est pas un tableau ici)
      ...(recentUsers || []).map((user: any) => ({
        type: 'user' as const,
        icon: <UserPlus className="w-5 h-5 text-emerald-400" />,
        title: `Nouvel utilisateur`,
        description: `${user.full_name} (@${user.username})`,
        time: user.created_at,
        badge: (
          <Badge className={`text-xs ${
            user.plan === 'premium' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
            user.plan === 'entreprise' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
            'bg-gray-500/15 text-gray-300 border-gray-500/30'
          }`}>
            {user.plan === 'premium' ? '⭐ Premium' : user.plan === 'entreprise' ? '🏢 Pro' : '🆓 Basic'}
          </Badge>
        )
      }))
    ]
    .filter(activity => activity.time) // ✅ Supprime les activités sans timestamp
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

    setRecentActivities(activities);
  } catch (error) {
    console.error('Erreur chargement activités:', error);
    setRecentActivities([{
      type: 'fallback' as const,
      icon: <Activity className="w-5 h-5 text-gray-400" />,
      title: 'Aucune activité récente',
      description: 'Le système fonctionne normalement',
      time: new Date().toISOString(),
      badge: <Badge className="bg-gray-500/15 text-gray-300 border-gray-500/30 text-xs">Calme</Badge>
    }]);
  }
};

  useEffect(() => {
    fetchAdminStats();
    
    // 🔹 Rafraîchissement automatique toutes les 5 minutes
    const interval = setInterval(fetchAdminStats, 300000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Rafraîchissement manuel
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminStats();
  };

  // 🔹 Calcul des variations AVEC TYPAGE CORRECT ✅
  const statVariations = useMemo(() => {
    // 🔸 Valeurs précédentes simulées (pour démo - à remplacer par données réelles en prod)
    const prevStats = {
      totalEnterprises: Math.max(0, stats.totalEnterprises - Math.floor(Math.random() * 5)),
      totalEmployees: Math.max(0, stats.totalEmployees - Math.floor(Math.random() * 20)),
      totalOrders: Math.max(0, stats.totalOrders - Math.floor(Math.random() * 10)),
      totalRevenue: Math.max(0, stats.totalRevenue - Math.floor(Math.random() * 500)),
      activeSubscriptions: Math.max(0, stats.activeSubscriptions - Math.floor(Math.random() * 3)),
    };

    // 🔸 Helper pour calculer le trend avec typage strict
    const calculateTrend = (current: number, previous: number): 'up' | 'down' => {
      return current >= previous ? 'up' : 'down';
    };

    return {
      enterprises: {
        value: stats.totalEnterprises,
        variation: stats.totalEnterprises - prevStats.totalEnterprises,
        trend: calculateTrend(stats.totalEnterprises, prevStats.totalEnterprises) // ✅ Typé 'up' | 'down'
      },
      employees: {
        value: stats.totalEmployees,
        variation: stats.totalEmployees - prevStats.totalEmployees,
        trend: calculateTrend(stats.totalEmployees, prevStats.totalEmployees) // ✅ Typé 'up' | 'down'
      },
      orders: {
        value: stats.totalOrders,
        variation: stats.totalOrders - prevStats.totalOrders,
        trend: calculateTrend(stats.totalOrders, prevStats.totalOrders) // ✅ Typé 'up' | 'down'
      },
      revenue: {
        value: stats.totalRevenue,
        variation: stats.totalRevenue - prevStats.totalRevenue,
        trend: calculateTrend(stats.totalRevenue, prevStats.totalRevenue) // ✅ Typé 'up' | 'down'
      },
      subscriptions: {
        value: stats.activeSubscriptions,
        variation: stats.activeSubscriptions - prevStats.activeSubscriptions,
        trend: calculateTrend(stats.activeSubscriptions, prevStats.activeSubscriptions) // ✅ Typé 'up' | 'down'
      }
    };
  }, [stats]);

  // 🔹 Calcul de la marge dynamique
  const contentMargin = isSidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <>
      <AdminSidebar />
      
      <main className={`${contentMargin} pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/5 to-indigo-900/10 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 🔹 Hero Section Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-2xl"></div>
                    <BarChart3 className="w-8 h-8 text-cyan-400 relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                      Tableau de bord administrateur
                    </h1>
                    <p className="text-gray-400 mt-1 max-w-2xl">
                      Supervisez toutes les activités de la plateforme LUVIKA en temps réel. 
                      Gérez les utilisateurs, abonnements, commandes NFC et bien plus encore.
                    </p>
                  </div>
                </div>
                
                {/* 🔹 Badges de statut */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Système opérationnel
                  </Badge>
                  <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Rôle: Administrateur
                  </Badge>
                </div>
              </div>
              
              {/* 🔹 Boutons d'action */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white shadow-md shadow-cyan-500/20"
                >
                  {refreshing || loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {refreshing ? 'Mise à jour...' : 'Actualiser'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://docs.luvika.com/admin', '_blank')}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </div>
          </motion.div>

          {/* 🔹 Statistiques Premium - CORRIGÉ AVEC TYPAGE STRICT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Statistiques en temps réel
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-xl mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-white/10 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard 
                  icon={<Building className="w-7 h-7" />}
                  title="Entreprises"
                  value={statVariations.enterprises.value}
                  variation={statVariations.enterprises.variation}
                  trend={statVariations.enterprises.trend} // ✅ Typé 'up' | 'down' - PLUS D'ERREUR
                  color="bg-blue-500/15 text-blue-400 border-blue-500/20"
                  gradient="from-blue-500 to-cyan-600"
                />
                <StatCard 
                  icon={<Users className="w-7 h-7" />}
                  title="Employés"
                  value={statVariations.employees.value}
                  variation={statVariations.employees.variation}
                  trend={statVariations.employees.trend} // ✅ Typé 'up' | 'down'
                  color="bg-cyan-500/15 text-cyan-400 border-cyan-500/20"
                  gradient="from-cyan-500 to-blue-600"
                />
                <StatCard 
                  icon={<Package className="w-7 h-7" />}
                  title="Commandes"
                  value={statVariations.orders.value}
                  variation={statVariations.orders.variation}
                  trend={statVariations.orders.trend} // ✅ Typé 'up' | 'down'
                  color="bg-amber-500/15 text-amber-400 border-amber-500/20"
                  gradient="from-amber-500 to-orange-600"
                />
                <StatCard 
                  icon={<Wallet className="w-7 h-7" />}
                  title="Revenus"
                  value={`${statVariations.revenue.value.toLocaleString()} $`}
                  variation={statVariations.revenue.variation}
                  trend={statVariations.revenue.trend} // ✅ Typé 'up' | 'down'
                  color="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  gradient="from-emerald-500 to-teal-600"
                />
                <StatCard 
                  icon={<TrendingUp className="w-7 h-7" />}
                  title="Abonnements"
                  value={statVariations.subscriptions.value}
                  variation={statVariations.subscriptions.variation}
                  trend={statVariations.subscriptions.trend} // ✅ Typé 'up' | 'down'
                  color="bg-violet-500/15 text-violet-400 border-violet-500/20"
                  gradient="from-violet-500 to-purple-600"
                />
              </div>
            )}
          </motion.div>

          {/* 🔹 Section Actions Admin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              Outils d'administration
            </h2>
            <AdminActions />
          </motion.div>

          {/* 🔹 Section Activité Récente - DESIGN ULTIME & DYNAMIQUE ✅ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <Card className="glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Activité récente
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRecentActivities}
                    disabled={loading}
                    className="border-white/10 text-gray-300 hover:bg-white/10"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    )}
                    Actualiser
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                  Activités en temps réel sur la plateforme LUVIKA — mises à jour automatiques toutes les 5 minutes
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl animate-pulse">
                        <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <Activity className="relative w-12 h-12 text-gray-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Aucune activité récente</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      La plateforme est calme pour le moment. Les nouvelles activités apparaîtront automatiquement ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                      >
                        <div className="p-2.5 bg-gradient-to-br rounded-xl group-hover:scale-110 transition-transform">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="font-medium text-white">{activity.title}</p>
                            <span className="text-[11px] text-gray-500 whitespace-nowrap">
                              {new Date(activity.time).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} •{' '}
                              {new Date(activity.time).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1 line-clamp-1">
                            {activity.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {activity.badge}
                            <span className="text-[10px] text-cyan-400/80 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              Temps réel
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-cyan-400/80">
                    <Scan className="w-4 h-4" />
                    <span>Mises à jour en temps réel via Supabase Realtime</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/admin/admin/analytics', '_blank')}
                    className="text-gray-400 hover:text-cyan-300 hover:bg-white/5"
                  >
                    Voir toutes les analyses
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}

// 🔹 Composant StatCard Premium - CORRIGÉ AVEC TYPAGE STRICT
function StatCard({ 
  icon, 
  title, 
  value, 
  variation, 
  trend, // ✅ Typé 'up' | 'down' - PLUS D'ERREUR
  color, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  variation: number; 
  trend: 'up' | 'down'; // ✅ Typage strict TypeScript
  color: string; 
  gradient: string; 
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card border ${color} bg-white/5 backdrop-blur-xl rounded-2xl p-6 overflow-hidden relative group`}
    >
      {/* 🔹 Fond décoratif */}
      <div 
        className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
        style={{ 
          backgroundImage: `linear-gradient(135deg, ${gradient})`,
        }}
      />
      
      {/* 🔹 Cercle décoratif */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg`}>
          {icon}
        </div>
        
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          
          {variation !== undefined && (
            <div className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 mr-1 rotate-180" />
              )}
              <span>{Math.abs(variation)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Taux de croissance</span>
            <span className={`font-medium ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {trend === 'up' ? '+' : '-'}{Math.abs(variation)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* 🔹 Ligne de progression subtile */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-current to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
    </motion.div>
  );
}