'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type Order = {
  id: string;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    email: string;
  } | null;
};

const ORDERS_PER_PAGE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      const {  data } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, username, email)
        `)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = orders.filter(order => {
      // 🔹 Filtre par statut
      if (filter !== 'all' && order.status !== filter) return false;

      // 🔎 Recherche
      if (search) {
        const term = search.toLowerCase();
        const profile = order.profiles;
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
        let aVal: any = a[key as keyof Order];
        let bVal: any = b[key as keyof Order];

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
  }, [orders, filter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredAndSorted.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
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
          <h3 className="text-xl font-medium text-white mb-2">Chargement des commandes...</h3>
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
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">En attente</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">En cours</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">Expédié</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Livré</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">Annulé</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnu</span>;
    }
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
        <h1 className="text-3xl font-bold text-white">{t('admin.orders.title')}</h1>
        <p className="text-gray-400">{t('admin.orders.subtitle')}</p>
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
          <ToggleGroupItem value="all" className="px-2 py-1 text-xs">Tous</ToggleGroupItem>
          <ToggleGroupItem value="pending" className="px-2 py-1 text-xs">En attente</ToggleGroupItem>
          <ToggleGroupItem value="processing" className="px-2 py-1 text-xs">En cours</ToggleGroupItem>
          <ToggleGroupItem value="shipped" className="px-2 py-1 text-xs">Expédié</ToggleGroupItem>
          <ToggleGroupItem value="delivered" className="px-2 py-1 text-xs">Livré</ToggleGroupItem>
          <ToggleGroupItem value="cancelled" className="px-2 py-1 text-xs">Annulé</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {paginatedOrders.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === 'all'
                ? t('admin.orders.no_orders')
                : 'Aucune commande trouvée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <Card key={order.id} className="glass-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">
                      {order.profiles?.full_name} (@{order.profiles?.username})
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{order.profiles?.email}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Quantité</p>
                      <p className="font-medium text-white">{order.quantity} carte(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Adresse</p>
                      <p className="text-gray-300">{order.shipping_address || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-gray-300">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Actions client */}
                  <div className="flex gap-2">
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/orders/${order.id}/update-status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'shipped' }),
                          });
                          if (res.ok) {
                            toast.success('✅ Commande expédiée !');
                            setTimeout(() => window.location.reload(), 1000);
                          } else {
                            toast.error('❌ Échec de l\'expédition');
                          }
                        }}
                        className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-sm"
                      >
                        Marquer comme expédiée
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={async () => {
                          if (confirm('Annuler cette commande ?')) {
                            const res = await fetch(`/api/admin/orders/${order.id}/cancel`, {
                              method: 'POST',
                            });
                            if (res.ok) {
                              toast.success('✅ Commande annulée !');
                              setTimeout(() => window.location.reload(), 1000);
                            } else {
                              toast.error('❌ Échec de l\'annulation');
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ✅ Pagination avancée */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Page {currentPage} sur {totalPages} ({filteredAndSorted.length} commandes)
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