// src/app/dashboard/subscribers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, User, Search, Filter, RefreshCw, Download, ArrowLeft,
  ShieldCheck, Ban, ChevronUp, ChevronDown, AlertCircle, CheckCircle,
  XCircle, EyeOff, Sparkles, TrendingUp, Calendar, Clock
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { createClient } from '../../../../src/lib/supabase/client';
import { toast } from 'sonner';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';

type Follower = {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio_short: string | null;
  verified: boolean | null;
  blocked: boolean;
};

export default function SubscribersPage() {
  const t = useTranslations('dashboard.subscribers');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<string | null>(null);
  const [filterBlocked, setFilterBlocked] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, verified: 0, blocked: 0, recent: 0 });

  // 🔹 Quick actions
  const quickActions = [
    { id: 'export', label: t('export'), icon: <Download className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
    { id: 'refresh', label: t('refresh'), icon: <RefreshCw className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'back', label: t('back'), icon: <ArrowLeft className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'export') handleExport();
    if (actionId === 'refresh') handleRefresh();
    if (actionId === 'back') router.push('/dashboard');
  };

  // 🔹 Chargement des données SÉCURISÉ avec tri côté client
const fetchFollowers = async () => {
  setLoading(true);
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push('/auth/sign-in');
      return;
    }

    // ✅ Appel RPC SANS .order() (non supporté par rpc())
    const { data, error } = await supabase
      .rpc('get_user_followers', { p_user_id: user.id });

    if (error) throw error;
    
    // 🔹 TRI CÔTÉ CLIENT (obligatoire pour rpc)
    let sortedData = [...(data || [])];
    if (sortBy === 'date') {
      sortedData.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'name') {
      sortedData.sort((a, b) => {
        const nameA = (a.full_name || a.username || '').toLowerCase();
        const nameB = (b.full_name || b.username || '').toLowerCase();
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      });
    }

    setFollowers(sortedData);
    
    // 🔹 Calcul des stats en temps réel
    setStats({
      total: sortedData.length,
      verified: sortedData.filter((f: any) => f.verified)?.length || 0,
      blocked: sortedData.filter((f: any) => f.blocked)?.length || 0,
      recent: sortedData.filter((f: any) => 
        new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )?.length || 0,
    });
  } catch (err: any) {
    console.error('❌ Erreur chargement abonnés:', err);
    toast.error('Impossible de charger les abonnés', {
      description: err.message || 'Vérifiez votre connexion',
      duration: 5000,
    });
    setFollowers([]);
    setStats({ total: 0, verified: 0, blocked: 0, recent: 0 });
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchFollowers();
  }, [sortBy, sortOrder]);

  const handleAction = async (followerId: string, action: 'block' | 'unblock') => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    if (action === 'block') {
      // Insérer un blocage
      const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: user.id, blocked_id: followerId });
      if (error) throw error;
    } else {
      // Supprimer le blocage
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', followerId);
      if (error) throw error;
    }

    // Mettre à jour l'état local
    setFollowers(prev =>
      prev.map(f => f.id === followerId ? { ...f, blocked: action === 'block' } : f)
    );

    toast.success(
      action === 'block'
        ? '✅ Abonné bloqué avec succès'
        : '✅ Abonné débloqué avec succès'
    );
  } catch (err) {
    console.error(err);
    toast.error(`Échec ${action === 'block' ? 'du blocage' : 'du déblocage'}`);
  }
};

  // 🔹 Export CSV
  const handleExport = async () => {
    if (followers.length === 0) {
      toast.warning('Aucun abonné à exporter');
      return;
    }

    try {
      const headers = ['Date', 'Nom', 'Pseudo', 'Vérifié', 'Bloqué'];
      const rows = followers.map(f => [
        new Date(f.created_at).toLocaleDateString('fr-FR'),
        f.full_name || '—',
        f.username || '—',
        f.verified ? 'Oui' : 'Non',
        f.blocked ? 'Oui' : 'Non',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abonnes_luvika_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('✅ Export CSV téléchargé !');
    } catch (err) {
      toast.error('❌ Échec de l\'export');
    }
  };

  // 🔹 Filtres
  const filteredFollowers = followers.filter(f => {
    const matchesSearch = !searchQuery || 
      (f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.bio_short?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesVerified = filterVerified === null || 
      (filterVerified === 'verified' ? f.verified : !f.verified);
    
    const matchesBlocked = filterBlocked === null || 
      (filterBlocked === 'blocked' ? f.blocked : !f.blocked);
    
    return matchesSearch && matchesVerified && matchesBlocked;
  });

  // 🔹 Helpers UI
  const formatDistance = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getBadgeVariant = (verified: boolean | null, blocked: boolean) => {
    if (blocked) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (verified) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 🔹 Déclarer DANS le composant (avant le return)
const handleRefresh = async () => {
  setRefreshing(true);
  await fetchFollowers();
  setRefreshing(false);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-4 border-cyan-400 animate-spin"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 En-tête moderne avec stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Gérez vos abonnés, vérifiez leur statut et contrôlez qui peut interagir avec votre profil
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.verified}</div>
                <div className="text-xs text-gray-400">Vérifiés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.recent}</div>
                <div className="text-xs text-gray-400">7 derniers jours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.blocked}</div>
                <div className="text-xs text-gray-400">Bloqués</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
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

        {/* 🔹 Filtres avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 🔹 Barre de recherche */}
          <Card className="glass-border bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un abonné par nom, pseudo ou bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔹 Filtres et tri */}
          <Card className="glass-border bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtre vérifié */}
                <div className="flex-1 min-w-[150px]">
                  <Label className="text-xs text-gray-400 mb-1 block">Statut</Label>
                  <Select 
                    value={filterVerified || 'all'} 
                    onValueChange={(v) => setFilterVerified(v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="verified">Vérifiés uniquement</SelectItem>
                      <SelectItem value="unverified">Non vérifiés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filtre bloqué */}
                <div className="flex-1 min-w-[150px]">
                  <Label className="text-xs text-gray-400 mb-1 block">Bloqués</Label>
                  <Select 
                    value={filterBlocked || 'all'} 
                    onValueChange={(v) => setFilterBlocked(v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="blocked">Bloqués uniquement</SelectItem>
                      <SelectItem value="unblocked">Non bloqués</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tri */}
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'name')}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Nom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Liste des abonnés */}
        <Card className="glass-border bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-cyan-400 w-5 h-5" />
                <span className="text-xl font-bold text-white">Vos abonnés</span>
              </div>
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredFollowers.length} abonné{filteredFollowers.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <Users className="relative w-16 h-16 text-gray-600 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchQuery || filterVerified || filterBlocked 
                    ? 'Aucun abonné trouvé' 
                    : 'Aucun abonné pour le moment'}
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchQuery || filterVerified || filterBlocked
                    ? 'Essayez de modifier vos filtres ou votre recherche'
                    : 'Partagez votre profil pour attirer des abonnés !'}
                </p>
                {!searchQuery && !filterVerified && !filterBlocked && (
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au tableau de bord
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFollowers.map((follower) => (
                  <motion.div
                    key={follower.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10">
                            {follower.avatar_url ? (
                              <img 
                                src={follower.avatar_url} 
                                alt={follower.username || ''} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-7 h-7 text-gray-400" />
                            )}
                          </div>
                          {follower.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg border-2 border-gray-900">
                              <ShieldCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {follower.blocked && (
                            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow-lg border-2 border-gray-900">
                              <Ban className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white text-lg truncate">
                              {follower.full_name || follower.username || 'Anonyme'}
                            </h3>
                            {follower.verified && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                                <ShieldCheck className="w-3 h-3 mr-0.5" />
                                Vérifié
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <span>@{follower.username || 'inconnu'}</span>
                            <span className="mx-1">•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDistance(follower.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-1">
                            {follower.bio_short || 'Aucune bio'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Abonné le</span>
                          <span className="font-medium text-white">
                            {new Date(follower.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 pt-2 sm:pt-0">
                          {follower.blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(follower.id, 'unblock')}
                              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Débloquer
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(follower.follower_id, 'block')}
                              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Bloquer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />
      </div>
    </div>
  );
}
