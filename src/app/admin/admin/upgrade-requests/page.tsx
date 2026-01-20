'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
    role?: string; // ✅ ajouté
  } | null;
};

const REQUESTS_PER_PAGE = 5;

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      // 🔹 Récupérer les demandes avec les profils
      const {  data } = await supabase
        .from('upgrade_requests')
        .select(`
          *,
          profiles!inner (id, full_name, username, email, plan, role)
        `)
        .order('created_at', { ascending: false });

      setRequests(data || []);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = requests.filter(req => {
      // 🔹 Filtre par statut
      if (filter !== 'all' && req.status !== filter) return false;
      
      // 🔹 Filtre par rôle
      const userRole = req.profiles?.role || 'user';
      if (roleFilter !== 'all' && userRole !== roleFilter) return false;

      // 🔎 Recherche
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

    // 📊 Tri
if (sortConfig) {
  const { key, direction } = sortConfig;
  result.sort((a, b) => {
    let aVal: any = a[key as keyof UpgradeRequest];
    let bVal: any = b[key as keyof UpgradeRequest];

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
  }, [requests, filter, roleFilter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / REQUESTS_PER_PAGE);
  const paginatedRequests = filteredAndSorted.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE
  );

  // 🔄 Réinitialiser à la page 1 quand filtre/recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, roleFilter, search]);

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
          <h3 className="text-xl font-medium text-white mb-2">Chargement des demandes...</h3>
          <p className="text-gray-400">Récupération des données depuis la base sécurisée</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnu</span>;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    return role === 'admin' ? (
      <Badge variant="secondary" className="flex items-center gap-1 bg-amber-500/20 text-amber-300">
        <ShieldCheck className="w-3 h-3" /> Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-300">
        <UserIcon className="w-3 h-3" /> User
      </Badge>
    );
  };

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
        <h1 className="text-3xl font-bold text-white">Demande de mise à niveau</h1>
        <p className="text-gray-400">Approuvez ou rejetez les demandes Premium/Entreprise.</p>
      </div>

      {/* 🔎 Barre de recherche + filtres */}
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

        <div className="flex gap-2">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => setFilter(value as any)}
            className="p-1 bg-white/5 rounded-lg border border-white/10"
          >
            <ToggleGroupItem value="all" className="px-2 py-1 text-xs">Tous</ToggleGroupItem>
            <ToggleGroupItem value="pending" className="px-2 py-1 text-xs">En attente</ToggleGroupItem>
            <ToggleGroupItem value="approved" className="px-2 py-1 text-xs">Approuvés</ToggleGroupItem>
            <ToggleGroupItem value="rejected" className="px-2 py-1 text-xs">Rejetés</ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as any)}
            className="p-1 bg-white/5 rounded-lg border border-white/10"
          >
            <ToggleGroupItem value="all" className="px-2 py-1 text-xs">Tous rôles</ToggleGroupItem>
            <ToggleGroupItem value="admin" className="px-2 py-1 text-xs">Admins</ToggleGroupItem>
            <ToggleGroupItem value="user" className="px-2 py-1 text-xs">Users</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {paginatedRequests.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === 'pending'
                ? 'Aucune demande en attente'
                : 'Aucune demande trouvée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedRequests.map((req) => (
              <Card key={req.id} className="glass-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg font-semibold text-white">
                        {req.profiles?.full_name} (@{req.profiles?.username})
                      </CardTitle>
                      {getRoleBadge(req.profiles?.role)}
                    </div>
                    <p className="text-gray-400 text-sm">{req.profiles?.email}</p>
                  </div>
                  {getStatusBadge(req.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Demandée le</p>
                      <p className="text-gray-300">
                        {new Date(req.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Traitée le</p>
                      <p className="text-gray-300">
                        {req.processed_at 
                          ? new Date(req.processed_at).toLocaleDateString('fr-FR') 
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Notes</p>
                      <p className="text-gray-300 italic">
                        {req.admin_notes || 'Aucune'}
                      </p>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/upgrade-requests/${req.id}/approve`, {
                            method: 'POST',
                          });
                          if (res.ok) {
                            toast.success('✅ Demande approuvée !');
                            setTimeout(() => window.location.reload(), 1000);
                          } else {
                            toast.error('❌ Échec de l\'approbation');
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/upgrade-requests/${req.id}/reject`, {
                            method: 'POST',
                          });
                          if (res.ok) {
                            toast.success('✅ Demande rejetée !');
                            setTimeout(() => window.location.reload(), 1000);
                          } else {
                            toast.error('❌ Échec du rejet');
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ✅ Pagination avancée */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Page {currentPage} sur {totalPages} ({filteredAndSorted.length} demandes)
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