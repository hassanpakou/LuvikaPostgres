// src/app/admin/admin/upgrade-requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ IMPORT COMPLET
import { createClient } from '../../../../../src/lib/supabase/client';
import { Badge } from '../../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, FileText, Clock, CheckCircle, XCircle, Search, ShieldCheck, User as UserIcon,
  AlertCircle, RefreshCw, Package, TrendingUp, TrendingDown, Calendar, Mail, AlertTriangle,
  Check, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';

type UpgradeRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_at: string | null;
  target_plan: string;
  profiles: {
    full_name: string;
    username: string;
    email: string;
    plan: string;
    role?: string;
  } | null;
};

const REQUESTS_PER_PAGE = 8;

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Chargement des demandes
  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      const { data, error } = await supabase
        .from('upgrade_requests')
        .select(`
          *,
          profiles!inner (id, full_name, username, email, plan, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement demandes:', error);
        toast.error('❌ Impossible de charger les demandes');
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [router]);

  // 🔹 Helper : Badge de statut avec animation pour pending
  const getStatusBadge = (status: string) => {
    const STATUS_CONFIG = {
      pending: { 
        icon: Clock, 
        color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', 
        label: 'En attente',
        animation: 'animate-pulse' 
      },
      approved: { 
        icon: CheckCircle, 
        color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', 
        label: 'Approuvé',
        animation: '' 
      },
      rejected: { 
        icon: XCircle, 
        color: 'bg-red-500/15 text-red-300 border-red-500/30', 
        label: 'Rejeté',
        animation: '' 
      },
    } as const;
    
    type StatusKey = keyof typeof STATUS_CONFIG;
    const safeStatus = (status && status in STATUS_CONFIG) ? (status as StatusKey) : 'pending';
    const { icon: Icon, color, label, animation } = STATUS_CONFIG[safeStatus];
    
    return (
      <Badge className={`flex items-center gap-1.5 ${color} border font-medium ${animation}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  // 🔹 Helper : Badge de rôle avec icône
  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    return role === 'admin' ? (
      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1 font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin</span>
      </Badge>
    ) : (
      <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 flex items-center gap-1 font-medium">
        <UserIcon className="w-3.5 h-3.5" />
        <span>User</span>
      </Badge>
    );
  };

  // 🔹 Helper : Badge de plan cible
  const getTargetPlanBadge = (targetPlan: string) => {
    const PLAN_CONFIG = {
      premium: { icon: TrendingUp, color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'Premium' },
      entreprise: { icon: Package, color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'Entreprise' },
    } as const;
    
    type PlanKey = keyof typeof PLAN_CONFIG;
    const safePlan = (targetPlan && targetPlan in PLAN_CONFIG) ? (targetPlan as PlanKey) : 'premium';
    const { icon: Icon, color, label } = PLAN_CONFIG[safePlan];
    
    return (
      <Badge className={`flex items-center gap-1 ${color} border font-medium`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = requests.filter(req => {
      if (filter !== 'all' && req.status !== filter) return false;
      const userRole = req.profiles?.role || 'user';
      if (roleFilter !== 'all' && userRole !== roleFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        const profile = req.profiles;
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
        let aVal: any = a[key as keyof UpgradeRequest];
        let bVal: any = b[key as keyof UpgradeRequest];
        if (key === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [requests, filter, roleFilter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / REQUESTS_PER_PAGE);
  const paginatedRequests = filteredAndSorted.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE
  );

  useEffect(() => setCurrentPage(1), [filter, roleFilter, search]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // 🔹 Actions avec confirmation et état de chargement
  const handleApprove = async (id: string) => {
    if (!confirm('✅ Confirmer l\'approbation de cette demande ?\nL\'utilisateur sera immédiatement mis à niveau.')) return;
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}/approved`, { method: 'POST' });
      if (res.ok) {
        toast.success('✅ Demande approuvée !', {
          description: 'L\'utilisateur a été mis à niveau avec succès',
          duration: 4000,
        });
        setTimeout(() => window.location.reload(), 800);
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('❌ Échec de l\'approbation', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
        duration: 5000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('❌ Confirmer le rejet de cette demande ?\nCette action est irréversible.')) return;
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}/rejected`, { method: 'POST' });
      if (res.ok) {
        toast.success('✅ Demande rejetée !', {
          description: 'L\'utilisateur a été informé de votre décision',
          duration: 4000,
        });
        setTimeout(() => window.location.reload(), 800);
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('❌ Échec du rejet', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
        duration: 5000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Loader élégant et professionnel
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/5 to-indigo-900/10 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-4 border-blue-500/30 animate-spin-slow"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des demandes...
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
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-full"></div>
                  <TrendingUp className="w-7 h-7 text-cyan-400 relative z-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  Demandes de mise à niveau
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Approuvez ou rejetez les demandes Premium/Entreprise des utilisateurs
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides avec icônes animées */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: requests.length, label: 'Total', icon: FileText, color: 'cyan' },
                { value: requests.filter(r => r.status === 'pending').length, label: 'En attente', icon: Clock, color: 'yellow' },
                { value: requests.filter(r => r.status === 'approved').length, label: 'Approuvées', icon: CheckCircle, color: 'emerald' },
                { value: requests.filter(r => r.status === 'rejected').length, label: 'Rejetées', icon: XCircle, color: 'red' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <Icon className={`absolute -bottom-2 -right-2 w-8 h-8 text-${stat.color}-500/20`} />
                    </div>
                  </motion.div>
                );
              })}
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
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(value) => setFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous', icon: FileText },
                  { value: 'pending', label: 'En attente', icon: Clock },
                  { value: 'approved', label: 'Approuvés', icon: CheckCircle },
                  { value: 'rejected', label: 'Rejetés', icon: XCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <ToggleGroupItem 
                      key={item.value} 
                      value={item.value} 
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${
                          filter === item.value
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
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous rôles', icon: UserIcon },
                  { value: 'admin', label: 'Admins', icon: ShieldCheck },
                  { value: 'user', label: 'Users', icon: UserIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <ToggleGroupItem 
                      key={item.value} 
                      value={item.value} 
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${
                          roleFilter === item.value
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
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

        {/* 🔹 Liste des demandes - Design moderne et engageant */}
        {paginatedRequests.length === 0 ? (
          <Card className="glass-card border border-dashed border-cyan-500/20 bg-cyan-900/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                >
                  <FileText className="relative w-16 h-16 text-gray-600 mx-auto" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'pending' 
                  ? 'Aucune demande en attente' 
                  : 'Aucune demande trouvée'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter !== 'all' 
                  ? 'Essayez de changer les filtres pour voir plus de demandes.'
                  : 'Il n\'y a aucune demande de mise à niveau pour le moment.'}
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedRequests.map((req) => {
              const isPending = req.status === 'pending';
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -3 }}
                  className={isPending ? 'relative before:content-[""] before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-yellow-400/30 before:animate-pulse' : ''}
                >
                  <Card 
                    className={`
                      glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300
                      ${isPending 
                        ? 'border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-yellow-500/15' 
                        : 'hover:border-cyan-500/30 hover:shadow-cyan-500/10'
                      }
                      hover:shadow-2xl
                    `}
                  >
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-xl relative overflow-hidden">
                            <div className={`absolute inset-0 ${isPending ? 'bg-yellow-500/10 animate-ping' : 'bg-cyan-500/10'} rounded-xl`}></div>
                            <TrendingUp className="w-6 h-6 text-cyan-400 relative z-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-bold text-white">
                                {req.profiles?.full_name}
                              </CardTitle>
                              {getRoleBadge(req.profiles?.role)}
                            </div>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-cyan-300">
                                <span>@{req.profiles?.username}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
                                <span className="hidden sm:inline">•</span>
                                {getTargetPlanBadge(req.target_plan)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <Clock className="w-4 h-4" />
                            <span>Demandée le</span>
                          </div>
                          <div className="text-white font-medium">
                            {new Date(req.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>Traitée le</span>
                          </div>
                          <div className="text-white font-medium">
                            {req.processed_at 
                              ? new Date(req.processed_at).toLocaleDateString('fr-FR') 
                              : <span className="text-gray-500">—</span>}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </div>
                          <div className="text-cyan-300 break-words">{req.profiles?.email}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Notes de l'administrateur</p>
                            <p className="text-gray-300 italic text-sm">
                              {req.admin_notes || <span className="text-gray-500">Aucune note</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 🔹 Actions contextuelles avec état de chargement */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId === req.id}
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20 relative overflow-hidden group"
                            >
                              {processingId === req.id ? (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                              )}
                              Approuver
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleReject(req.id)}
                              disabled={processingId === req.id}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 relative overflow-hidden group"
                            >
                              {processingId === req.id ? (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              ) : (
                                <X className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                              )}
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        {req.status === 'approved' && (
                          <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Demande approuvée ✅</span>
                          </div>
                        )}
                        
                        {req.status === 'rejected' && (
                          <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 font-medium flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            <span>Demande rejetée ❌</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> demandes
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border-white/15 bg-white/5 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
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
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}