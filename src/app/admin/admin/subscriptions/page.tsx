// src/app/admin/admin/subscriptions/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // ✅ IMPORT AJOUTÉ ICI
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  RefreshCw,
  Package,
  ShieldCheck,
  Zap,
  Crown,
  Building,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Subscription = {
  id: string;
  plan: 'basic' | 'premium' | 'entreprise';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    email: string;
  } | null;
};

const SUBSCRIPTIONS_PER_PAGE = 8; // ✅ Augmenté pour meilleure densité

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium' | 'entreprise'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!left (id, full_name, username, email)
        `)
        .order('created_at', { ascending: false });

      setSubscriptions(data || []);
      setLoading(false);
    };

    fetchSubscriptions();
  }, []);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = subscriptions.filter(sub => {
      if (planFilter !== 'all' && sub.plan !== planFilter) return false;
      if (statusFilter !== 'all') {
        const isActive = sub.status === 'active';
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }
      if (search) {
        const term = search.toLowerCase();
        const profile = sub.profiles;
        if (!profile) return false;
        return (
          profile.full_name?.toLowerCase().includes(term) ||
          profile.username?.toLowerCase().includes(term) ||
          profile.email?.toLowerCase().includes(term)
        );
      }
      return true;
    });

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof Subscription];
        let bVal: any = b[key as keyof Subscription];
        if (key === 'activated_at' || key === 'expires_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [subscriptions, planFilter, statusFilter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / SUBSCRIPTIONS_PER_PAGE);
  const paginatedSubscriptions = filteredAndSorted.slice(
    (currentPage - 1) * SUBSCRIPTIONS_PER_PAGE,
    currentPage * SUBSCRIPTIONS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [planFilter, statusFilter, search]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // 🔹 Mise à jour du statut avec feedback visuel
  const updateSubscriptionStatus = async (id: string, action: 'activate' | 'deactivate') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/${action}`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error();
      
      const message = action === 'activate' 
        ? '✅ Abonnement activé avec succès'
        : '✅ Abonnement désactivé avec succès';
      
      toast.success(message, {
        description: `Le statut de l'abonnement a été mis à jour`,
        duration: 3000,
      });
      
      // ✅ Mise à jour optimiste de l'UI
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, status: action === 'activate' ? 'active' : 'canceled' }
            : sub
        )
      );
      
      // Recharger après 500ms pour synchronisation BDD
      setTimeout(() => {
        setUpdatingId(null);
      }, 500);
    } catch (error) {
      toast.error(`❌ Échec de la ${action === 'activate' ? 'l\'activation' : 'la désactivation'}`, {
        description: 'Une erreur est survenue. Veuillez réessayer.',
        duration: 4000,
      });
      setUpdatingId(null);
    }
  };

  // ✅ Loader élégant et professionnel
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/5 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-4 border-blue-500/30 animate-spin-slow"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des abonnements...
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Récupération sécurisée des données depuis la base de données LUVIKA
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Helper : Badge de plan avec icône
  const getPlanBadge = (plan: string) => {
  // 🔹 Définir le mapping avec typage explicite
  const PLAN_CONFIG = {
    basic: { 
      icon: Package, 
      color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', 
      label: 'Basic' 
    },
    premium: { 
      icon: Crown, 
      color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', 
      label: 'Premium' 
    },
    entreprise: { 
      icon: Building, 
      color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', 
      label: 'Entreprise' 
    },
  } as const; // ✅ Verrouille les types pour TypeScript

  // 🔹 Définir le type des clés valides
  type PlanKey = keyof typeof PLAN_CONFIG;
  
  // 🔹 Vérification de sécurité avec fallback
  const safePlan = (plan && plan in PLAN_CONFIG) ? (plan as PlanKey) : 'basic';
  const { icon: Icon, color, label } = PLAN_CONFIG[safePlan];

  return (
    <Badge className={`flex items-center gap-1.5 ${color} border font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </Badge>
  );
};

  // 🔹 Helper : Badge de statut avec icône
  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <Badge className={`flex items-center gap-1.5 ${
        isActive 
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
          : 'bg-red-500/15 text-red-300 border-red-500/30'
      } border font-medium`}>
        {isActive ? (
          <>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Actif</span>
          </>
        ) : (
          <>
            <XCircle className="w-3.5 h-3.5" />
            <span>Inactif</span>
          </>
        )}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/5 to-indigo-900/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 En-tête élégant avec gradient */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('admin.nav.back_to_dashboard')}</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl">
                  <CreditCard className="w-7 h-7 text-cyan-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('admin.modules.subscriptions.title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                {t('admin.modules.subscriptions.description')}
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{subscriptions.length}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {subscriptions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Actifs</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {subscriptions.filter(s => s.plan === 'premium' || s.plan === 'entreprise').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Premium</div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 🔹 Barre de recherche + filtres - Design premium */}
        <div className="glass-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 mb-8 shadow-xl shadow-black/30">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <ToggleGroup
                type="single"
                value={planFilter}
                onValueChange={(value) => setPlanFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous plans', icon: CreditCard },
                  { value: 'basic', label: 'Basic', icon: Package },
                  { value: 'premium', label: 'Premium', icon: Crown },
                  { value: 'entreprise', label: 'Entreprise', icon: Building },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <ToggleGroupItem 
                      key={item.value} 
                      value={item.value} 
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${
                          planFilter === item.value
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>

              <ToggleGroup
                type="single"
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous statuts', icon: RefreshCw },
                  { value: 'active', label: 'Actifs', icon: CheckCircle },
                  { value: 'inactive', label: 'Inactifs', icon: XCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <ToggleGroupItem 
                      key={item.value} 
                      value={item.value} 
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${
                          statusFilter === item.value
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* 🔹 Liste des abonnements - Design moderne et lisible */}
        {paginatedSubscriptions.length === 0 ? (
          <Card className="glass-card border border-dashed border-white/20 bg-white/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <CreditCard className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aucun abonnement trouvé</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {planFilter === 'all' && statusFilter === 'all'
                  ? 'Il n\'y a aucun abonnement dans le système pour le moment.'
                  : `Aucun abonnement correspondant aux filtres "${planFilter}" et "${statusFilter}" n'a été trouvé.`}
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => {
                  setPlanFilter('all');
                  setStatusFilter('all');
                  setSearch('');
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedSubscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              >
                <Card className="glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-xl">
                          <User className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold text-white">
                              {sub.profiles?.full_name}
                            </CardTitle>
                            {getStatusBadge(sub.status)}
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-cyan-300">
                              <Mail className="w-4 h-4" />
                              <span>{sub.profiles?.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
                              <span className="hidden sm:inline">•</span>
                              <span>@{sub.profiles?.username}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(sub.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <CreditCard className="w-4 h-4" />
                          <span>Plan</span>
                        </div>
                        <div className="font-medium">
                          {getPlanBadge(sub.plan)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Activé le</span>
                        </div>
                        <div className="text-white font-medium">
                          {sub.activated_at 
                            ? new Date(sub.activated_at).toLocaleDateString('fr-FR') 
                            : <span className="text-gray-500">—</span>}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Zap className="w-4 h-4" />
                          <span>Expire le</span>
                        </div>
                        <div className={`font-medium ${
                          sub.expires_at ? 'text-white' : 'text-yellow-400'
                        }`}>
                          {sub.expires_at 
                            ? new Date(sub.expires_at).toLocaleDateString('fr-FR') 
                            : 'Jamais (à vie)'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 🔹 Actions contextuelles avec feedback visuel */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
                      {sub.status !== 'active' && (
                        <Button
                          onClick={() => updateSubscriptionStatus(sub.id, 'activate')}
                          disabled={updatingId === sub.id}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20"
                        >
                          {updatingId === sub.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Activer l'abonnement
                        </Button>
                      )}
                      
                      {sub.status === 'active' && (
                        <Button
                          onClick={() => updateSubscriptionStatus(sub.id, 'deactivate')}
                          disabled={updatingId === sub.id}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          {updatingId === sub.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Désactiver
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ID: {sub.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* 🔹 Pagination moderne et fluide */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="text-sm text-gray-400">
              Page <span className="font-medium text-white">{currentPage}</span> sur{' '}
              <span className="font-medium text-white">{totalPages}</span> •{' '}
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> abonnements
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border-white/15 bg-white/5 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {getPageNumbers().map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={`
                    w-10 h-10 rounded-xl font-medium transition-all
                    ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white'
                    }
                  `}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border-white/15 bg-white/5 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}