// src/app/admin/admin/nfc/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // ✅ IMPORT AJOUTÉ
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Smartphone, Search, Plus, X, Mail, Send, AlertTriangle, Key,
  Info, RefreshCw, Package, AlertCircle, CheckCircle, Truck, XCircle,
  User, Calendar, Lock, Unlock, ShieldCheck,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';

type NfcCard = {
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  activated_at: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    email: string;
        plan?: string | null; // ✅ AJOUTÉ ICI
  } | null;
  matricule?: string | null;
};

const CARDS_PER_PAGE = 8; // ✅ Augmenté pour meilleure densité

export default function NfcPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lost' | 'blocked' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  // 🔑 États pour le modal de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [usersWithOrders, setUsersWithOrders] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [sendingMatricule, setSendingMatricule] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🔹 Chargement des cartes NFC
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || user.user_metadata?.role !== 'admin') {
          router.push('/auth/sign-in');
          return;
        }

        const { data, error } = await supabase
  .from('nfc_cards')
  .select(`
    *,
    profiles!left(full_name, username, email, plan)
  `)
  .order('created_at', { ascending: false });

        if (error) throw error;
        setCards(data || []);
      } catch (error: any) {
        console.error('❌ ERREUR CHARGEMENT CARTES NFC:', error);
        toast.error('❌ Impossible de charger les cartes NFC');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [router]);

  // 🔹 Helper : Badge de statut NFC avec typage strict
  const getNfcStatusBadge = (status: string) => {
    const STATUS_CONFIG = {
      active: { icon: Unlock, color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Active' },
      lost: { icon: AlertTriangle, color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Perdue' },
      blocked: { icon: Lock, color: 'bg-red-500/15 text-red-300 border-red-500/30', label: 'Bloquée' },
      inactive: { icon: XCircle, color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', label: 'Inactive' },
    } as const;
    
    type StatusKey = keyof typeof STATUS_CONFIG;
    const safeStatus = (status && status in STATUS_CONFIG) ? (status as StatusKey) : 'inactive';
    const { icon: Icon, color, label } = STATUS_CONFIG[safeStatus];
    
    return (
      <Badge className={`flex items-center gap-1.5 ${color} border font-medium`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  // 🔹 Helper : Badge de rôle utilisateur
const getUserRoleBadge = (plan?: string | null) => {
  
    const PLAN_CONFIG = {
      basic: { icon: User, color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', label: 'Basic' },
      premium: { icon: ShieldCheck, color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'Premium' },
      entreprise: { icon: Building, color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'Entreprise' },
    } as const;
    
    type PlanKey = keyof typeof PLAN_CONFIG;
const safePlan = (plan && ['basic', 'premium', 'entreprise'].includes(plan)) 
    ? (plan as 'basic' | 'premium' | 'entreprise') 
    : 'basic';    const { icon: Icon, color, label } = PLAN_CONFIG[safePlan];
    
    return (
      <Badge className={`flex items-center gap-1 ${color} border font-medium`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = cards.filter(card => {
      const cardStatus = String(card.status).trim().toLowerCase();
      const filterStatus = statusFilter === 'all' ? null : statusFilter?.toLowerCase();
      
      if (filterStatus && cardStatus !== filterStatus) return false;

      if (search) {
        const term = search.toLowerCase();
        const profile = card.profiles;
        return (
          card.card_id.toLowerCase().includes(term) ||
          (profile?.full_name?.toLowerCase().includes(term)) ||
          (profile?.username?.toLowerCase().includes(term)) ||
          (profile?.email?.toLowerCase().includes(term))
        );
      }
      return true;
    });

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof NfcCard];
        let bVal: any = b[key as keyof NfcCard];

        if (key === 'created_at' || key === 'activated_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [cards, statusFilter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / CARDS_PER_PAGE);
  const paginatedCards = filteredAndSorted.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  useEffect(() => setCurrentPage(1), [statusFilter, search]);

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

  // 🔹 Charger les utilisateurs avec commandes NFC
  const fetchUsersWithOrders = async () => {
    setLoadingUsers(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          quantity,
          status,
          product_type,
          created_at,
          profiles!inner (
            id,
            full_name,
            username,
            email,
            phone,
            plan
          )
        `)
        .in('status', ['pending', 'processing'])
        .eq('product_type', 'nfc_premium')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsersWithOrders(data || []);
      
      if (!data || data.length === 0) {
        toast.info('ℹ️ Aucune commande NFC en attente');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement commandes NFC:', error);
      toast.error('❌ Impossible de charger les commandes NFC');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 🔹 Ouvrir le modal = charger les utilisateurs
  const openCreateModal = async () => {
    setIsModalLoading(true);
    setIsCreateModalOpen(true);
    
    if (!usersWithOrders.length) {
      await fetchUsersWithOrders();
    }
    
    setIsModalLoading(false);
  };

  // 🔹 Créer la carte NFC
  const handleCreateCard = async () => {
    if (!selectedUserId) {
      toast.error('⚠️ Sélectionnez un utilisateur');
      return;
    }

    const order = usersWithOrders.find(o => o.user_id === selectedUserId);
    if (!order) {
      toast.error('❌ Commande introuvable');
      return;
    }

    setCreatingCard(true);
    try {
      const response = await fetch('/api/admin/nfc/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Échec création');

      setCreatedCard(result.card);
      toast.success('✅ Carte NFC créée avec succès !');
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setCreatingCard(false);
    }
  };

  // 🔹 Envoyer le matricule par email
  const handleSendMatricule = async () => {
    if (!createdCard?.matricule) {
      toast.error('⚠️ Matricule non disponible');
      return;
    }

    const order = usersWithOrders.find(o => o.user_id === createdCard.user_id);
    if (!order?.profiles?.email) {
      toast.error('❌ Email non trouvé');
      return;
    }

    setSendingMatricule(true);
    try {
      const response = await fetch('/api/admin/nfc/send-matricule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          card_id: createdCard.id,
          email: order.profiles.email,
          matricule: createdCard.matricule,
          full_name: order.profiles.full_name
        }),
      });

      if (!response.ok) throw new Error('Échec envoi email');
      
      toast.success('✅ Matricule envoyé par email !');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreatedCard(null);
        setSelectedUserId(null);
        setModalSearch('');
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setSendingMatricule(false);
    }
  };

  // 🔹 UTILISATEURS FILTRÉS DANS LE MODAL
  const filteredUsers = usersWithOrders.filter(order => {
    if (!modalSearch) return true;
    const term = modalSearch.toLowerCase();
    return (
      order.profiles?.full_name?.toLowerCase().includes(term) ||
      order.profiles?.username?.toLowerCase().includes(term) ||
      order.profiles?.email?.toLowerCase().includes(term)
    );
  });

  // ✅ Loader élégant et professionnel
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/5 to-indigo-900/10 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-4 border-orange-500/30 animate-spin-slow"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-300 mb-3">
                Chargement des cartes NFC...
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Récupération sécurisée des données depuis la base de données LUVIKA
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-progress"></div>
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
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl">
                  <Smartphone className="w-7 h-7 text-amber-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-300">
                  {t('admin.modules.nfc.title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                {t('admin.modules.nfc.description')}
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{cards.length}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {cards.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Actives</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {cards.filter(c => c.status === 'lost').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Perdues</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {cards.filter(c => c.status === 'blocked').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Bloquées</div>
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
                placeholder="Rechercher par nom, email ou ID carte..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
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
            
            <ToggleGroup
              type="single"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
              className="p-1.5 bg-white/10 rounded-xl border border-white/20"
            >
              {[
                { value: 'all', label: 'Tous', icon: Smartphone },
                { value: 'active', label: 'Actives', icon: Unlock },
                { value: 'lost', label: 'Perdues', icon: AlertTriangle },
                { value: 'blocked', label: 'Bloquées', icon: Lock },
                { value: 'inactive', label: 'Inactives', icon: XCircle },
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

        {/* 🔹 Liste des cartes NFC - Design moderne */}
        {paginatedCards.length === 0 ? (
          <Card className="glass-card border border-dashed border-amber-500/20 bg-amber-900/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Smartphone className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {statusFilter === 'all' 
                  ? 'Aucune carte NFC trouvée' 
                  : `Aucune carte avec le statut "${statusFilter}"`}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {statusFilter !== 'all' 
                  ? 'Essayez de changer les filtres pour voir plus de cartes.'
                  : 'Il n\'y a aucune carte NFC dans le système pour le moment.'}
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
                <Button
                  onClick={openCreateModal}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:from-amber-600 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Créer une carte NFC
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              >
                <Card className="glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500/15 to-orange-500/15 rounded-xl">
                          <Smartphone className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold text-white">
                              {card.profiles?.full_name}
                            </CardTitle>
                            {getNfcStatusBadge(card.status)}
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <span>@{card.profiles?.username}</span>
                            </div>
<div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
  <span className="hidden sm:inline">•</span>
  {getUserRoleBadge(card.profiles?.plan)} {/* ✅ Plus d'erreur */}
</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(card.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Key className="w-4 h-4" />
                          <span>ID Carte</span>
                        </div>
                        <div className="text-white font-mono text-sm break-all">{card.card_id}</div>
                      </div>
                      
                      {card.matricule && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <Package className="w-4 h-4" />
                            <span>Matricule</span>
                          </div>
                          <div className="text-amber-300 font-bold text-lg">{card.matricule}</div>
                        </div>
                      )}
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Créée le</span>
                        </div>
                        <div className="text-white">
                          {new Date(card.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                          <Unlock className="w-4 h-4" />
                          <span>Activée le</span>
                        </div>
                        <div className="text-white">
                          {card.activated_at ? new Date(card.activated_at).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </div>
                    </div>
                    
                    {/* ✅ Actions client - VERSION AMÉLIORÉE */}
<div className="flex gap-2">
  {card.status === 'active' && (
    <button
      onClick={async () => {
        if (confirm('Bloquer cette carte NFC ?\n\n⚠️ Cette action est irréversible. La carte sera définitivement inutilisable.')) {
          try {
            const res = await fetch(`/api/admin/nfc/${card.id}/block`, {
              method: 'POST',
            });
            
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || 'Échec du blocage');
            }
            
            toast.success('✅ Carte bloquée !');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err: any) {
            console.error('Erreur blocage:', err);
            toast.error('❌ ' + err.message);
          }
        }
      }}
      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm transition-all flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Lock className="w-3.5 h-3.5" /> Bloquer
    </button>
  )}
  {(card.status === 'lost' || card.status === 'blocked' || card.status === 'inactive') && (
    <button
      onClick={async () => {
        const action = card.status === 'lost' ? 'déclarée perdue' : 
                      card.status === 'blocked' ? 'bloquée' : 'inactive';
        
        if (confirm(`Réactiver cette carte ${action} ?\n\n✅ La carte retrouvera son statut actif et pourra être utilisée normalement.`)) {
          try {
            const res = await fetch(`/api/admin/nfc/${card.id}/activate`, {
              method: 'POST',
            });
            
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || 'Échec de la réactivation');
            }
            
            toast.success('✅ Carte réactivée !');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err: any) {
            console.error('Erreur réactivation:', err);
            toast.error('❌ ' + err.message);
          }
        }
      }}
      className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm transition-all flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
    >
      <RefreshCw className="w-3.5 h-3.5" /> Réactiver
    </button>
  )}
</div>   </CardContent>
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
              <span className="font-medium text-amber-400">{filteredAndSorted.length}</span> cartes
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
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
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

        {/* 🔹 BOUTON FLOTTANT CRÉER CARTE (Mobile) */}
        <motion.div 
          className="fixed bottom-6 right-6 sm:hidden z-40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={openCreateModal}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-2xl shadow-amber-500/40 hover:from-amber-600 hover:to-orange-700"
            aria-label="Créer une carte NFC"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* 🔹 MODAL CRÉATION CARTE NFC - DESIGN PREMIUM */}
        {isCreateModalOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => {
              setIsCreateModalOpen(false);
              setCreatedCard(null);
              setSelectedUserId(null);
              setModalSearch('');
              setIsModalLoading(false);
            }}
          >
            <div 
              className="glass-card backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 border border-white/15 relative max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreatedCard(null);
                  setSelectedUserId(null);
                  setModalSearch('');
                  setIsModalLoading(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-amber-400" />
                {createdCard ? '✅ Matricule généré' : 'Créer une carte NFC'}
              </h2>

              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-amber-300 font-medium">Chargement des commandes en attente...</p>
                  <p className="text-amber-200/70 text-sm mt-2">Veuillez patienter</p>
                </div>
              ) : !createdCard ? (
                // 🔹 ÉTAPE 1 : SÉLECTION UTILISATEUR
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sélectionnez un utilisateur ayant une commande en attente
                    </label>
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, email..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-amber-400"
                    />
                  </div>

                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-400 mt-2">Chargement des commandes...</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {filteredUsers.map((order) => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            selectedUserId === order.user_id
                              ? 'bg-amber-500/15 border border-amber-500/30 ring-2 ring-amber-500/20'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/20'
                          }`}
                          onClick={() => setSelectedUserId(order.user_id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {order.profiles?.full_name}
                                {order.quantity > 1 && (
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-0.5">
                                    {order.quantity} cartes
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-300">@{order.profiles?.username}</div>
                              <div className="text-xs text-gray-400 mt-1">{order.profiles?.email}</div>
                              {order.profiles?.phone && (
                                <div className="text-xs text-cyan-300">{order.profiles.phone}</div>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {order.status === 'pending' ? 'En attente' : 'En cours'}
                              </span>
                              <span className="text-xs text-gray-400 mt-1">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                          <p className="text-amber-200 font-medium">Aucune commande NFC en attente</p>
                          <p className="text-amber-300/70 text-sm mt-1">
                            Les utilisateurs doivent passer une commande via le dashboard
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setSelectedUserId(null);
                        setModalSearch('');
                        setIsModalLoading(false);
                      }}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateCard}
                      disabled={!selectedUserId || creatingCard}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                    >
                      {creatingCard ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Création...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Créer la carte
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // 🔹 ÉTAPE 2 : MATRICULE GÉNÉRÉ + ENVOI EMAIL
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-amber-300/80 mb-1">Matricule généré</p>
                        <p className="text-3xl font-bold text-amber-400 tracking-wider">
                          {createdCard.matricule}
                        </p>
                      </div>
                      <Smartphone className="w-12 h-12 text-amber-400/70" />
                    </div>
                    <p className="text-xs text-amber-200 mt-2">
                      Ce matricule unique permettra à l'utilisateur d'activer sa carte NFC via son dashboard
                    </p>
                  </div>

                  <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-200 mb-2 flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        L'email sera envoyé à : <span className="font-bold text-white">
                          {usersWithOrders.find(o => o.user_id === createdCard.user_id)?.profiles?.email}
                        </span>
                      </span>
                    </p>
                    <p className="text-xs text-blue-300/80 mt-2">
                      L'utilisateur recevra un email avec son matricule et les instructions pour activer sa carte
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCreatedCard(null);
                        setSelectedUserId(null);
                        setModalSearch('');
                        setIsModalLoading(false);
                      }}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Créer une autre carte
                    </Button>
                    <Button
                      onClick={handleSendMatricule}
                      disabled={sendingMatricule}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                    >
                      {sendingMatricule ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le matricule par email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}