'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// createClient n'est pas utilisé ici
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
  const [users, setUsers] = useState<any[]>([]); // Les utilisateurs avec isBanned
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Optionnel : Si tu as besoin de l'ID de l'utilisateur connecté côté client
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // Récupérer les utilisateurs
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        router.push('/auth/sign-in');
        return;
      }
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      // Vérifier que data est un tableau
      if (!Array.isArray(data)) {
        console.error("Erreur: L'API /api/admin/users n'a pas retourné un tableau.", data);
        setUsers([]);
        return;
      }

  // 🔹 Modifie la logique de transformation de isBanned
      // isBanned est vrai si banned_until est une date future ou infinie (selon Supabase)
      // Supabase met 'infinity' pour un ban permanent, ou une date temporaire.
      // On vérifie si banned_until est une chaîne et qu'elle n'est pas 'null'
      // OU si c'est une date dans le futur.
      const usersWithStatus = data.map((u: any) => {
        // Vérifie si banned_until est défini et n'est pas 'null' (sous forme de chaîne)
        // ou si c'est une date dans le futur
        const isBanned = u.banned_until && u.banned_until !== 'null';
        // OU, si tu veux être plus strict et vérifier si c'est une date future :
        // const isBanned = u.banned_until && new Date(u.banned_until) > new Date();

        return {
          ...u,
          isBanned: isBanned,
        };
      });

      setUsers(usersWithStatus);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      // Gérer l'erreur (afficher un message à l'utilisateur)
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, [router]);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = users.filter(user => {
      // Utilisez isBanned qui est maintenant dans chaque user
      if (filter === 'banned') return user.isBanned;
      if (filter === 'active') return !user.isBanned;
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
  }, [users, filter, search, sortConfig]);

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
      <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
                </div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full bg-slate-950"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Chargement des utilisateurs ...
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Récupération des données depuis la base sécurisée
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
              </div>
            </div>
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
                  // isBanned est maintenant directement sur u
                  const isBanned = u.isBanned;
                  // Optionnel : Si tu as récupéré l'ID de l'utilisateur connecté
                  // const isSelf = u.id === currentUserId;
                  // Pour l'instant, on ne sait pas l'ID côté client, donc isSelf est probablement faux
                  const isSelf = false; // ou remplacez par la logique appropriée si currentUserId est disponible

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