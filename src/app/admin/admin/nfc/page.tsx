'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  ArrowLeft,
  Smartphone,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';

type NfcCard = {
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked';
  activated_at: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    email: string;
  } | null;
};

const CARDS_PER_PAGE = 5;

export default function NfcPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lost' | 'blocked'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const fetchCards = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/auth/sign-in');
        return;
      }

      const {  data } = await supabase
        .from('nfc_cards')
        .select(`
          *,
          profiles (full_name, username, email)
        `)
        .order('created_at', { ascending: false });

      setCards(data || []);
      setLoading(false);
    };

    fetchCards();
  }, []);

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = cards.filter(card => {
      // 🔹 Filtre par statut
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;

      // 🔎 Recherche
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

    // 📊 Tri
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof NfcCard];
        let bVal: any = b[key as keyof NfcCard];

        // Gérer les dates
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

  // 🔄 Réinitialiser à la page 1 quand filtre/recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

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

      {/* Bulle glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

        <div className="flex flex-col items-center text-center">

          {/* Boule circulaire */}
          <div className="relative w-20 h-20 mb-6">

            {/* Cercle externe */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>

            {/* Aiguille qui tourne */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
            </div>

            {/* Cœur lumineux */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-6 rounded-full bg-slate-950"></div>
          </div>

          {/* Texte */}
          <h3 className="text-lg font-semibold text-white mb-1">
            Chargement des cartes NFC...
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Récupération des données depuis la base sécurisée
          </p>

          {/* Barre de progression */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Active</span>;
      case 'lost':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Perdue</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">Bloquée</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnue</span>;
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
        <h1 className="text-3xl font-bold text-white">{t('admin.modules.nfc.title')}</h1>
        <p className="text-gray-400">{t('admin.modules.nfc.description')}</p>
      </div>

      {/* 🔎 Barre de recherche + filtre */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (nom, username, email, ID carte...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as any)}
          className="p-1 bg-white/5 rounded-lg border border-white/10"
        >
          <ToggleGroupItem value="all" className="px-2 py-1 text-xs">Tous statuts</ToggleGroupItem>
          <ToggleGroupItem value="active" className="px-2 py-1 text-xs">Actives</ToggleGroupItem>
          <ToggleGroupItem value="lost" className="px-2 py-1 text-xs">Perdues</ToggleGroupItem>
          <ToggleGroupItem value="blocked" className="px-2 py-1 text-xs">Bloquées</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {paginatedCards.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {statusFilter === 'all'
                ? t('admin.nfc.no_cards')
                : 'Aucune carte trouvée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedCards.map((card) => (
              <Card key={card.id} className="glass-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">
                      {card.profiles?.full_name} (@{card.profiles?.username})
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{card.card_id}</p>
                  </div>
                  {getStatusBadge(card.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">{t('admin.nfc.status')}</p>
                      <p className="font-medium text-white">
                        {t(`admin.nfc.status.${card.status}`)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('admin.nfc.activated')}</p>
                      <p className="text-gray-300">
                        {card.activated_at ? new Date(card.activated_at).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('admin.nfc.created')}</p>
                      <p className="text-gray-300">
                        {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Actions client */}
                  <div className="flex gap-2">
                    {card.status === 'active' && (
                      <button
                        onClick={async () => {
                          if (confirm('Bloquer cette carte NFC ?')) {
                            const res = await fetch(`/api/admin/nfc/${card.id}/block`, {
                              method: 'POST',
                            });
                            if (res.ok) {
                              toast.success('✅ Carte bloquée !');
                              setTimeout(() => window.location.reload(), 1000);
                            } else {
                              toast.error('❌ Échec du blocage');
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm"
                      >
                        Bloquer
                      </button>
                    )}
                    {card.status === 'lost' && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/nfc/${card.id}/activate`, {
                            method: 'POST',
                          });
                          if (res.ok) {
                            toast.success('✅ Carte réactivée !');
                            setTimeout(() => window.location.reload(), 1000);
                          } else {
                            toast.error('❌ Échec de la réactivation');
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm"
                      >
                        Réactiver
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
                Page {currentPage} sur {totalPages} ({filteredAndSorted.length} cartes)
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