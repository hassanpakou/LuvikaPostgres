// src/app/admin/admin/orders/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // ✅ IMPORT AJOUTÉ ICI
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  Package, ArrowLeft, Search, Truck, CheckCircle, XCircle, RotateCcw,
  Calendar, MapPin, User, Mail, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const ORDERS_PER_PAGE = 8; // ✅ Augmenté pour meilleure densité

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Chargement des commandes
  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('❌ Erreur chargement commandes');
        console.error(error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = orders.filter(order => {
      if (filter !== 'all' && order.status !== filter) return false;
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

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof Order];
        let bVal: any = b[key as keyof Order];
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
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // 🔹 Mise à jour du statut avec feedback visuel
  const updateOrderStatus = async (orderId: string, newStatus: string, actionName: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la mise à jour');
      
      toast.success(`✅ ${actionName} effectuée`, {
        description: `La commande a été mise à jour avec succès`,
        duration: 3000,
      });
      
      // ✅ Mise à jour optimiste de l'UI
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
      
      // Recharger après 500ms pour synchronisation BDD
      setTimeout(() => {
        setUpdatingOrderId(null);
      }, 500);
    } catch (error: any) {
      toast.error(`❌ ${actionName} échouée`, {
        description: error.message || 'Une erreur est survenue',
        duration: 4000,
      });
      setUpdatingOrderId(null);
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
                  <Package className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des commandes...
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

  // 🔹 Helper : Badge de statut amélioré avec icône
  // 🔹 Définir le type de statut UNE FOIS pour toute l'application (en haut du fichier)
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// 🔹 Helper : Mapping des statuts avec typage strict
const STATUS_CONFIG: Record<OrderStatus, { 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
  label: string;
}> = {
  pending: { 
    icon: AlertCircle, 
    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', 
    label: 'En attente' 
  },
  processing: { 
    icon: RefreshCw, 
    color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', 
    label: 'En cours' 
  },
  shipped: { 
    icon: Truck, 
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', 
    label: 'Expédié' 
  },
  delivered: { 
    icon: CheckCircle, 
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', 
    label: 'Livré' 
  },
  cancelled: { 
    icon: XCircle, 
    color: 'bg-red-500/15 text-red-300 border-red-500/30', 
    label: 'Annulé' 
  },
};

// 🔹 Type guard pour valider le statut
const isValidOrderStatus = (status: string): status is OrderStatus => {
  return status in STATUS_CONFIG;
};

// 🔹 Fonction avec validation runtime
const getStatusBadge = (status: string) => {
  const config = isValidOrderStatus(status) 
    ? STATUS_CONFIG[status] 
    : { icon: Package, color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', label: 'Inconnu' };
  
  const Icon = config.icon;
  
  return (
    <Badge className={`flex items-center gap-1.5 ${config.color} border font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
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
                  <Package className="w-7 h-7 text-cyan-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('admin.orders.title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                {t('admin.orders.subtitle')}
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{orders.length}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">En attente</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Livrées</div>
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
                { value: 'all', label: 'Toutes', icon: Package },
                { value: 'pending', label: 'En attente', icon: AlertCircle },
                { value: 'processing', label: 'En cours', icon: RefreshCw },
                { value: 'shipped', label: 'Expédiées', icon: Truck },
                { value: 'delivered', label: 'Livrées', icon: CheckCircle },
                { value: 'cancelled', label: 'Annulées', icon: XCircle },
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

        {/* 🔹 Liste des commandes - Design moderne et lisible */}
        {paginatedOrders.length === 0 ? (
          <Card className="glass-card border border-dashed border-white/20 bg-white/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Package className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aucune commande trouvée</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter === 'all'
                  ? 'Il n\'y a aucune commande dans le système pour le moment.'
                  : `Aucune commande correspondant au filtre "${filter}" n'a été trouvée.`}
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <motion.div
                key={order.id}
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
                              {order.profiles?.full_name}
                            </CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-cyan-300">
                              <Mail className="w-4 h-4" />
                              <span>{order.profiles?.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
                              <span className="hidden sm:inline">•</span>
                              <span>@{order.profiles?.username}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Package className="w-4 h-4" />
                          <span>Quantité</span>
                        </div>
                        <div className="text-xl font-bold text-white">{order.quantity} carte(s)</div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>Adresse de livraison</span>
                        </div>
                        <div className="text-white font-medium line-clamp-2">
                          {order.shipping_address || <span className="text-gray-500">Non spécifiée</span>}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Truck className="w-4 h-4" />
                          <span>Statut actuel</span>
                        </div>
                        <div className="font-medium">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                    
                    {/* 🔹 Actions contextuelles avec feedback visuel */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
                      {/* ✅ PENDING → PROCESSING */}
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'processing', 'Validation')}
                          disabled={updatingOrderId === order.id}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20"
                        >
                          {updatingOrderId === order.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Valider la commande
                        </Button>
                      )}
                      
                      {/* ✅ PROCESSING → SHIPPED + ANNULER */}
                      {order.status === 'processing' && (
                        <>
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'shipped', 'Expédition')}
                            disabled={updatingOrderId === order.id}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
                          >
                            {updatingOrderId === order.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4 mr-2" />
                            )}
                            Marquer comme expédiée
                          </Button>
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'cancelled', 'Annulation')}
                            disabled={updatingOrderId === order.id}
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Annuler la commande
                          </Button>
                        </>
                      )}
                      
                      {/* ✅ SHIPPED → DELIVERED */}
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'delivered', 'Confirmation de livraison')}
                          disabled={updatingOrderId === order.id}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20"
                        >
                          {updatingOrderId === order.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirmer la livraison
                        </Button>
                      )}
                      
                      {/* ✅ DELIVERED → Lecture seule */}
                      {order.status === 'delivered' && (
                        <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Livraison confirmée ✅</span>
                        </div>
                      )}
                      
                      {/* ✅ CANCELLED → Lecture seule */}
                      {order.status === 'cancelled' && (
                        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 font-medium flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          <span>Commande annulée ❌</span>
                        </div>
                      )}
                      
                      {/* 🔁 RESET à PENDING (admin uniquement) */}
                      {['processing', 'shipped', 'delivered', 'cancelled'].includes(order.status) && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'pending', 'Réinitialisation')}
                          disabled={updatingOrderId === order.id}
                          variant="ghost"
                          className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          <span className="hidden sm:inline">Réinitialiser</span>
                        </Button>
                      )}
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
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> commandes
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