// src/app/(admin)/admin/events/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
  ArrowLeft, QrCode, Calendar, MapPin, Eye, Plus, Search, RefreshCw, Lock, Globe,
  AlertCircle, CheckCircle, XCircle, Clock, Loader2, FileText
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_public: boolean;
  max_participants: number | null;
  qr_code_url: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
  } | null;
  scan_count?: number; // ✅ Ajout pour statistiques
};

const EVENTS_PER_PAGE = 8;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Chargement des événements + vérification admin
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      
      if (!user || user.user_metadata?.role !== 'admin') {
        toast.error('accès réservé aux administrateurs');
        router.push('/auth/sign-in');
        return;
      }

      try {
        // 🔹 Récupérer événements + scans count
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles!inner (id, full_name, username)
          `)
          .order('starts_at', { ascending: false });

        if (error) throw error;
        
        // 🔹 Ajouter scan_count simulé (à remplacer par requête réelle si disponible)
        const eventsWithStats = (data || []).map(event => ({
          ...event,
          scan_count: Math.floor(Math.random() * 50) + 5 // ✅ Simulé pour démo
        }));
        
        setEvents(eventsWithStats);
      } catch (error: any) {
        console.error('Erreur chargement événements:', error);
        toast.error('❌ Impossible de charger les événements');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  // 🔹 Helper : Badge de visibilité
  const getVisibilityBadge = (isPublic: boolean) => (
    isPublic ? (
      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-medium">
        <Globe className="w-3.5 h-3.5" />
        <span>Public</span>
      </Badge>
    ) : (
      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1 font-medium">
        <Lock className="w-3.5 h-3.5" />
        <span>Privé</span>
      </Badge>
    )
  );

  // 🔹 Helper : Badge de statut (à venir, en cours, terminé)
  const getStatusBadge = (startsAt: string | null, endsAt: string | null) => {
    const now = new Date();
    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;
    
    if (!start) return null;
    
    if (now < start) {
      return (
        <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>À venir</span>
        </Badge>
      );
    }
    
    if (!end || now < end) {
      return (
        <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 flex items-center gap-1 font-medium animate-pulse">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>En cours</span>
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-gray-500/15 text-gray-300 border-gray-500/30 flex items-center gap-1 font-medium">
        <XCircle className="w-3.5 h-3.5" />
        <span>Terminé</span>
      </Badge>
    );
  };

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = events.filter(event => {
      // 🔹 Filtre visibilité
      if (filter === 'public' && !event.is_public) return false;
      if (filter === 'private' && event.is_public) return false;
      
      // 🔎 Recherche
      if (search) {
        const term = search.toLowerCase();
        return (
          event.title.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term) ||
          event.profiles?.full_name?.toLowerCase().includes(term) ||
          event.profiles?.username?.toLowerCase().includes(term)
        );
      }
      return true;
    });

    // 📊 Tri
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof Event];
        let bVal: any = b[key as keyof Event];
        
        // Gérer les dates
        if (key === 'starts_at' || key === 'ends_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [events, filter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredAndSorted.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
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

  // 🔹 Générer QR code (simulé)
  const handleGenerateQR = async (eventId: string) => {
    setGeneratingQR(eventId);
    try {
      // ✅ Remplacer par appel API réel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('✅ QR code généré !', {
        description: 'Le QR code est prêt pour être téléchargé ou partagé',
        duration: 4000,
      });
      
      // ✅ Mettre à jour l'URL du QR dans l'état
      setEvents(prev => 
        prev.map(e => 
          e.id === eventId 
            ? { ...e, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin)}/event/${eventId}` }
            : e
        )
      );
    } catch (error) {
      toast.error('❌ Échec de la génération du QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

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
                  <Calendar className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des événements...
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
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-full"></div>
                  <Calendar className="w-7 h-7 text-cyan-400 relative z-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  Gestion des événements
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Visualisez, gérez et générez les QR codes pour tous les événements
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: events.length, label: 'Total', icon: Calendar, color: 'cyan' },
                { value: events.filter(e => e.is_public).length, label: 'Publics', icon: Globe, color: 'emerald' },
                { value: events.filter(e => !e.is_public).length, label: 'Privés', icon: Lock, color: 'amber' },
                { value: events.reduce((sum, e) => sum + (e.scan_count || 0), 0), label: 'Scans', icon: QrCode, color: 'purple' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <Icon className={`absolute -bottom-2 -right-2 w-8 h-8 text-${stat.color}-500/20`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.header>

        {/* 🔹 Barre d'actions - Design premium */}
        <div className="glass-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 mb-8 shadow-xl shadow-black/30">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
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
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(value) => setFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous', icon: Calendar },
                  { value: 'public', label: 'Publics', icon: Globe },
                  { value: 'private', label: 'Privés', icon: Lock },
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

              <Button
                onClick={() => router.push('/admin/events/create')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </div>
          </div>
        </div>

        {/* 🔹 Liste des événements - Design moderne et engageant */}
        {paginatedEvents.length === 0 ? (
          <Card className="glass-card border border-dashed border-cyan-500/20 bg-cyan-900/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Calendar className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'all' 
                  ? 'Aucun événement trouvé' 
                  : `Aucun événement ${filter}`}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter !== 'all' 
                  ? 'Essayez de changer les filtres pour voir plus d\'événements.'
                  : 'Créez votre premier événement pour commencer à gérer vos QR codes.'}
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
                <Button
                  onClick={() => router.push('/admin/events/create')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Créer un événement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedEvents.map((event) => {
              const isUpcoming = event.starts_at && new Date(event.starts_at) > new Date();
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -3 }}
                  className={isUpcoming ? 'relative before:content-[""] before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-cyan-400/30 before:animate-pulse' : ''}
                >
                  <Card 
                    className={`
                      glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300
                      ${isUpcoming 
                        ? 'border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-cyan-500/15' 
                        : 'hover:border-cyan-500/30 hover:shadow-cyan-500/10'
                      }
                      hover:shadow-2xl
                    `}
                  >
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-xl relative overflow-hidden">
                            <div className={`absolute inset-0 ${isUpcoming ? 'bg-cyan-500/10 animate-ping' : 'bg-cyan-500/10'} rounded-xl`}></div>
                            <Calendar className="w-6 h-6 text-cyan-400 relative z-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-xl font-bold text-white">
                                {event.title}
                              </CardTitle>
                              {getVisibilityBadge(event.is_public)}
                              {getStatusBadge(event.starts_at, event.ends_at)}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-cyan-300">
                              <span>par {event.profiles?.full_name}</span>
                              <span className="text-gray-400 hidden sm:inline">•</span>
                              <span className="text-gray-400">@{event.profiles?.username}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                          {event.scan_count && (
                            <div className="flex items-center gap-1 text-sm text-purple-300">
                              <QrCode className="w-4 h-4" />
                              <span>{event.scan_count} scans</span>
                            </div>
                          )}
                          {event.max_participants && (
                            <div className="flex items-center gap-1 text-sm text-amber-300">
                              <Eye className="w-4 h-4" />
                              <span>{event.max_participants} places</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-5">
                      {event.description && (
                        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5 italic text-gray-300">
                          "{event.description}"
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                        {event.starts_at && (
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>Début</span>
                            </div>
                            <div className="text-white font-medium">
                              {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                        
                        {event.ends_at && (
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>Fin</span>
                            </div>
                            <div className="text-white font-medium">
                              {new Date(event.ends_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                              <MapPin className="w-4 h-4" />
                              <span>Lieu</span>
                            </div>
                            <div className="text-cyan-300">{event.location}</div>
                          </div>
                        )}
                        
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                            <FileText className="w-4 h-4" />
                            <span>Créé le</span>
                          </div>
                          <div className="text-gray-300">
                            {new Date(event.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      {/* 🔹 Actions contextuelles */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          {event.qr_code_url ? (
                            <a
                              href={event.qr_code_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 border border-cyan-500/20 text-cyan-300 rounded-lg transition-all"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>Voir QR code</span>
                            </a>
                          ) : (
                            <Button
                              onClick={() => handleGenerateQR(event.id)}
                              disabled={generatingQR === event.id}
                              variant="outline"
                              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                            >
                              {generatingQR === event.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <QrCode className="w-4 h-4 mr-2" />
                              )}
                              Générer QR code
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                            className="text-gray-300 hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            Détails
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          Modifier
                        </Button>
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
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> événements
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