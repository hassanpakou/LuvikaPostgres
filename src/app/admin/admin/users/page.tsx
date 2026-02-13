// src/app/admin/admin/users/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // ✅ IMPORT AJOUTÉ
import { Badge } from '../../../../../components/ui/badge';
import { UserActions } from '../../../../../components/admin/UserActions';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Users, ShieldCheck, ShieldX, Lock, Unlock, Search,
  Mail, Calendar, User as UserIcon, AlertCircle, RefreshCw, Building, Crown,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const USERS_PER_PAGE = 8; // ✅ Augmenté pour meilleure densité

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Récupérer les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.status === 403) {
          router.push('/auth/sign-in');
          return;
        }
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Erreur: L'API n'a pas retourné un tableau", data);
          setUsers([]);
          return;
        }

        // 🔹 Déterminer le statut de ban
        const usersWithStatus = data.map((u: any) => ({
          ...u,
          isBanned: u.banned_until && u.banned_until !== 'null' && new Date(u.banned_until) > new Date(),
        }));

        setUsers(usersWithStatus);
      } catch (err) {
        console.error("Erreur récupération utilisateurs:", err);
        toast.error('❌ Impossible de charger les utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = users.filter(user => {
      if (filter === 'banned') return user.isBanned;
      if (filter === 'active') return !user.isBanned;
      return true;
    });

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        u =>
          u.full_name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
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
  }, [users, filter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / USERS_PER_PAGE);
  const paginatedUsers = filteredAndSorted.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => setCurrentPage(1), [filter, search]);

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

  // 🔹 Helper : Badge de rôle avec icône
  const getRoleBadge = (isSelf: boolean, plan?: string) => {
    if (isSelf) {
      return (
        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </Badge>
      );
    }
    
    // 🔹 Badge plan utilisateur
    const PLAN_CONFIG = {
      basic: { icon: UserIcon, color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', label: 'Basic' },
      premium: { icon: Crown, color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'Premium' },
      entreprise: { icon: Building, color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'Entreprise' },
    } as const;
    
    type PlanKey = keyof typeof PLAN_CONFIG;
    const safePlan = (plan && plan in PLAN_CONFIG) ? (plan as PlanKey) : 'basic';
    const { icon: Icon, color, label } = PLAN_CONFIG[safePlan];
    
    return (
      <Badge className={`flex items-center gap-1 ${color} border font-medium`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  // 🔹 Helper : Badge de statut
  const getStatusBadge = (isBanned: boolean) => (
    isBanned ? (
      <Badge className="bg-red-500/15 text-red-300 border-red-500/30 flex items-center gap-1 font-medium">
        <Lock className="w-3.5 h-3.5" />
        <span>Banni</span>
      </Badge>
    ) : (
      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-medium">
        <Unlock className="w-3.5 h-3.5" />
        <span>Actif</span>
      </Badge>
    )
  );

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
                  <Users className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des utilisateurs...
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
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl">
                  <Users className="w-7 h-7 text-cyan-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('admin.modules.users.title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                {t('admin.modules.users.description')}
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{users.length}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {users.filter(u => !u.isBanned).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Actifs</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {users.filter(u => u.isBanned).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Bannis</div>
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
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(value) => setFilter(value as any)}
              className="p-1.5 bg-white/10 rounded-xl border border-white/20"
            >
              {[
                { value: 'all', label: 'Tous', icon: Users },
                { value: 'active', label: 'Actifs', icon: Unlock },
                { value: 'banned', label: 'Bannis', icon: Lock },
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
          </div>
        </div>

        {/* 🔹 Liste des utilisateurs - Design moderne et lisible */}
        {paginatedUsers.length === 0 ? (
          <Card className="glass-card border border-dashed border-white/20 bg-white/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Users className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'banned' ? 'Aucun utilisateur banni' : 
                 filter === 'active' ? 'Aucun utilisateur actif' : 
                 'Aucun utilisateur trouvé'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter !== 'all' 
                  ? 'Essayez de changer les filtres pour voir plus d\'utilisateurs.'
                  : 'Il n\'y a aucun utilisateur dans le système pour le moment.'}
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => {
                  setFilter('all');
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
            {paginatedUsers.map((u) => {
              const isBanned = u.isBanned;
              const isSelf = false; // À implémenter si nécessaire

              return (
                <motion.div
                  key={u.id}
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
                            <UserIcon className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-bold text-white">
                                {u.full_name}
                              </CardTitle>
                              {getStatusBadge(isBanned)}
                            </div>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-cyan-300">
                                <span>@{u.username}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
                                <span className="hidden sm:inline">•</span>
                                {getRoleBadge(isSelf, u.plan)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </div>
                          <div className="text-white font-medium break-words">{u.email}</div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <Users className="w-4 h-4" />
                            <span>ID Utilisateur</span>
                          </div>
                          <div className="text-gray-300 font-mono text-sm">{u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                      
                      {/* 🔹 Actions contextuelles */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <UserActions
                          id={u.id}
                          isSelf={isSelf}
                          username={u.username || 'utilisateur'}
                          isBanned={isBanned}
                        />
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
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> utilisateurs
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