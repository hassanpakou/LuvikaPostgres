'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Badge } from '../../../../../components/ui/badge';
import { UserActions } from '../../../../../components/admin/UserActions';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const USERS_PER_PAGE = 5;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // Dans UsersPage.tsx
useEffect(() => {
  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.status === 403) {
      router.push('/auth/sign-in');
      return;
    }
    const data = await res.json();
    
    // Mappe banned_until → isBanned
    const usersWithStatus = data.map((u: any) => ({
      ...u,
      isBanned: u.banned_until === 'infinity',
    }));

    setUsers(usersWithStatus);
    setLoading(false);
  };

  fetchUsers();
}, []);
  const bannedMap = new Map(authUsers.map(u => [u.id, u.banned_until === 'infinity']));

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = users.filter(user => {
      const isBanned = bannedMap.get(user.id) === true;
      if (filter === 'banned') return isBanned;
      if (filter === 'active') return !isBanned;
      return true;
    });

    // 🔎 Recherche
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        u =>
          u.full_name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    // 📊 Tri
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        // Gérer les dates
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
  }, [users, filter, search, sortConfig, bannedMap]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / USERS_PER_PAGE);
  const paginatedUsers = filteredAndSorted.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // 🔄 Réinitialiser à la page 1 quand filtre/recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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
          <h3 className="text-xl font-medium text-white mb-2">Chargement des utilisateurs...</h3>
          <p className="text-gray-400">Récupération des données depuis la base sécurisée</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-white">{t('admin.modules.users.title')}</h1>
        <p className="text-gray-400">{t('admin.modules.users.description')}</p>
      </div>

      {/* 🔎 Barre de recherche + filtre */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
          className="p-1 bg-white/5 rounded-lg border border-white/10"
        >
          <ToggleGroupItem value="all" className="px-3 py-1.5 text-sm">
            Tous
          </ToggleGroupItem>
          <ToggleGroupItem value="active" className="px-3 py-1.5 text-sm">
            Actifs
          </ToggleGroupItem>
          <ToggleGroupItem value="banned" className="px-3 py-1.5 text-sm">
            Bannis
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {paginatedUsers.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === 'banned'
                ? 'Aucun utilisateur banni'
                : filter === 'active'
                ? 'Aucun utilisateur actif'
                : 'Aucun utilisateur trouvé'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    onClick={() => handleSort('full_name')}
                    className="py-3 px-4 text-left text-gray-400 font-medium cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center gap-1">
                      Nom
                      {sortConfig?.key === 'full_name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Utilisateur</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Email</th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="py-3 px-4 text-left text-gray-400 font-medium cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center gap-1">
                      Inscription
                      {sortConfig?.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Rôle</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Actions</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const isBanned = bannedMap.get(u.id) === true;
                  const isSelf = u.id === currentUserId;

                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{u.full_name}</td>
                      <td className="py-3 px-4 text-cyan-300">@{u.username}</td>
                      <td className="py-3 px-4 text-gray-300">{u.email}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs">
                            <ShieldCheck className="w-3 h-3" /> Admin 🛡️
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            <ShieldX className="w-3 h-3" /> User
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <UserActions
                          id={u.id}
                          isSelf={isSelf}
                          username={u.username || 'utilisateur'}
                          isBanned={isBanned}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {isBanned ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Banni
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Unlock className="h-3 w-3" /> Actif
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination avancée */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Page {currentPage} sur {totalPages} ({filteredAndSorted.length} utilisateurs)
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-white/10 bg-white/5 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  ‹
                </button>
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      page === currentPage
                        ? 'bg-cyan-600 text-white'
                        : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-white/10 bg-white/5 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}