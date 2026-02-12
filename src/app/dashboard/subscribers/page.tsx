// src/app/dashboard/subscribers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, User, Search, Filter, RefreshCw, Download, ArrowLeft,
  ShieldCheck, Ban, ChevronUp, ChevronDown
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';

// Types
type Follower = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles?: { full_name?: string; username?: string; avatar_url?: string; bio_short?: string; verified?: boolean };
  verified?: boolean;
  blocked?: boolean;
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

  // 🔹 Définir les actions DU MENU RAPIDE (avant le return)
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

  // 🔹 Gestionnaire d'actions (avant le return)
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'export':
        // TODO: Implémenter l'export CSV des abonnés
        alert('💡 Fonctionnalité d\'export en développement');
        break;
      case 'refresh':
        handleRefresh();
        break;
      case 'back':
        router.push('/dashboard');
        break;
    }
  };

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('followers')
        .select(`
          *,
          profiles!followers_follower_id_fkey (
            full_name,
            username,
            avatar_url,
            bio_short,
            verified
          )
        `)
        .eq('following_id', user.id)
        .order(sortBy === 'date' ? 'created_at' : 'profiles.full_name', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setFollowers(data || []);
    } catch (err) {
      console.error('❌ Erreur chargement abonnés:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [sortBy, sortOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFollowers();
    setRefreshing(false);
  };

  const handleAction = async (id: string, action: 'block' | 'unblock' | 'verify' | 'unverify') => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let updates: any = {};
      switch (action) {
        case 'block':
          updates = { blocked: true };
          break;
        case 'unblock':
          updates = { blocked: false };
          break;
        case 'verify':
          updates = { verified: true };
          break;
        case 'unverify':
          updates = { verified: false };
          break;
      }

      const { error } = await supabase
        .from('followers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setFollowers(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    } catch (err) {
      console.error('❌ Erreur action abonné:', err);
      alert('❌ Échec de l\'action');
    }
  };

  const filteredFollowers = followers.filter(f => {
    const matchesSearch = !searchQuery ||
      (f.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.profiles?.bio_short?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVerified = filterVerified === null ? true : (filterVerified === 'verified' ? !!f.profiles?.verified : !f.profiles?.verified);
    const matchesBlocked = filterBlocked === null ? true : (filterBlocked === 'blocked' ? !!f.blocked : !f.blocked);
    return matchesSearch && matchesVerified && matchesBlocked;
  });

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

  const getBadgeColor = (verified: boolean, blocked: boolean) => {
    if (blocked) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (verified) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

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
          <Button onClick={() => alert('💡 Fonctionnalité d\'export en développement')}>
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
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('filter_verified')}</Label>
            </div>
            <Select value={filterVerified || 'all'} onValueChange={(v: string) => setFilterVerified(v === 'all' ? null : v as 'verified' | 'unverified')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('all_verified')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_verified')}</SelectItem>
                <SelectItem value="verified">{t('verified')}</SelectItem>
                <SelectItem value="unverified">{t('unverified')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('filter_blocked')}</Label>
            </div>
            <Select value={filterBlocked || 'all'} onValueChange={(v: string) => setFilterBlocked(v === 'all' ? null : v as 'blocked' | 'unblocked')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('all_blocked')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_blocked')}</SelectItem>
                <SelectItem value="blocked">{t('blocked')}</SelectItem>
                <SelectItem value="unblocked">{t('unblocked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tri */}
      <Card className="glass-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-gray-300">{t('sort_by')}</Label>
              <Select value={sortBy} onValueChange={(v: 'date' | 'name') => setSortBy(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t('sort.date')}</SelectItem>
                  <SelectItem value="name">{t('sort.name')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-gray-300">{t('order')}</Label>
              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {sortOrder === 'asc' ? t('asc') : t('desc')}
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {filteredFollowers.length} {t('results')}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-cyan-400" />
            {t('subscribers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t('no_subscribers')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFollowers.map(f => (
                <div key={f.id} className="p-4 glass-border rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                        {f.profiles?.avatar_url ? (
                          <img src={f.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{f.profiles?.full_name}</div>
                        <div className="text-sm text-gray-400">@{f.profiles?.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getBadgeColor(!!f.profiles?.verified, !!f.blocked)}>
                        {f.blocked ? t('blocked') : f.profiles?.verified ? t('verified') : t('regular')}
                      </Badge>
                      {f.profiles?.verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {f.blocked && <Ban className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2 line-clamp-2">{f.profiles?.bio_short || t('no_bio')}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDistance(f.created_at)}</span>
                    <div className="flex gap-1">
                      {f.blocked ? (
                        <Button variant="outline" size="sm" onClick={() => handleAction(f.id, 'unblock')}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {t('unblock')}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleAction(f.id, 'block')}>
                          <Ban className="w-3 h-3 mr-1" />
                          {t('block')}
                        </Button>
                      )}
                      {f.profiles?.verified ? (
                        <Button variant="outline" size="sm" onClick={() => handleAction(f.id, 'unverify')}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {t('unverify')}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleAction(f.id, 'verify')}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {t('verify')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 MENU FLOTTANT - PLACÉ À L'INTÉRIEUR DU CONTENEUR PRINCIPAL */}
      <DashboardQuickMenu 
        onAction={handleQuickAction} 
        actions={quickActions} 
      />
    </div>
  );
}