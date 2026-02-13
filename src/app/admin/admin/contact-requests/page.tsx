// src/app/(admin)/admin/contact-requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Textarea } from '../../../../../components/ui/textarea';
import {
  ArrowLeft, Mail, Phone, MessageSquare, Eye, CheckCircle, X, Send,
  RefreshCw, AlertCircle, User, Clock, FileText, ReplyAll, Archive, Trash2,
  ChevronDown, ChevronUp, Search, Filter
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/ui/toggle-group';
import { Input } from '@/components/ui/input';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  replied_at?: string | null;
  profiles: {
    full_name: string;
    username: string;
  } | null;
};

const REQUESTS_PER_PAGE = 8;

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const router = useRouter();
  const t = useTranslations();

  // 🔹 Chargement des demandes
  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data : { user } } = await supabase.auth.getUser();
      
      if (!user || user.user_metadata?.role !== 'admin') {
        toast.error('accès réservé aux administrateurs');
        router.push('/auth/sign-in');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('contact_requests')
          .select(`
            *,
            profiles!inner (id, full_name, username)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error: any) {
        console.error('Erreur chargement demandes:', error);
        toast.error('❌ Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  // 🔹 Helper : Badge de statut
  const getStatusBadge = (isRead: boolean, repliedAt?: string | null) => {
    if (repliedAt) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Répondu</span>
        </Badge>
      );
    }
    return isRead ? (
      <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 flex items-center gap-1 font-medium">
        <Eye className="w-3.5 h-3.5" />
        <span>Lu</span>
      </Badge>
    ) : (
      <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 flex items-center gap-1 font-medium animate-pulse">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Nouveau</span>
      </Badge>
    );
  };

  // 🔹 Marquer comme lu
  const markAsRead = async (requestId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('contact_requests')
        .update({ is_read: true })
        .eq('id', requestId);

      if (error) throw error;
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, is_read: true } : req
        )
      );
      
      toast.success('✅ Message marqué comme lu');
    } catch (error) {
      toast.error('❌ Échec de la mise à jour');
    }
  };

  // 🔹 Répondre au message
  const handleReply = async () => {
    if (!replyingTo || !replyMessage.trim()) return;
    
    setIsSending(true);
    try {
      const request = requests.find(r => r.id === replyingTo);
      if (!request) throw new Error('Message non trouvé');

      // 🔹 Appel API pour envoyer l'email
      const response = await fetch('/api/admin/contact-requests/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: replyingTo,
          toEmail: request.email,
          toName: request.name,
          message: replyMessage,
          profileName: request.profiles?.full_name || 'Utilisateur LUVIKA'
        }),
      });

      if (!response.ok) throw new Error('Échec de l\'envoi');

      // 🔹 Mettre à jour l'UI
      setRequests(prev => 
        prev.map(req => 
          req.id === replyingTo 
            ? { ...req, is_read: true, replied_at: new Date().toISOString() }
            : req
        )
      );
      
      toast.success('✅ Réponse envoyée avec succès !', {
        description: `Un email a été envoyé à ${request.name}`,
        duration: 5000,
      });
      
      // 🔹 Fermer le formulaire et réinitialiser
      setReplyingTo(null);
      setReplyMessage('');
    } catch (error) {
      toast.error('❌ Échec de l\'envoi', {
        description: "Une erreur est survenue. Veuillez réessayer.",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  // 🔹 Supprimer le message
  const handleDelete = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('✅ Message supprimé');
    } catch (error) {
      toast.error('❌ Échec de la suppression');
    }
  };

  // 🔍 Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    let result = requests.filter(req => {
      // 🔹 Filtre par statut
      if (filter === 'unread' && req.is_read) return false;
      if (filter === 'replied' && !req.replied_at) return false;
      
      // 🔎 Recherche
      if (search) {
        const term = search.toLowerCase();
        return (
          req.name.toLowerCase().includes(term) ||
          req.email.toLowerCase().includes(term) ||
          req.message.toLowerCase().includes(term) ||
          req.profiles?.full_name?.toLowerCase().includes(term) ||
          req.profiles?.username?.toLowerCase().includes(term)
        );
      }
      return true;
    });

    // 📊 Tri
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let aVal: any = a[key as keyof ContactRequest];
        let bVal: any = b[key as keyof ContactRequest];
        
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
  }, [requests, filter, search, sortConfig]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / REQUESTS_PER_PAGE);
  const paginatedRequests = filteredAndSorted.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE
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

  // 🔹 Toggle expansion
  const toggleExpand = (id: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
                  <Mail className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 mb-3">
                Chargement des messages...
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
                  <Mail className="w-7 h-7 text-cyan-400 relative z-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  Messages visiteurs
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Gérez les demandes de contact des profils publics et répondez directement depuis cette interface
              </p>
            </div>
            
            {/* 🔹 Statistiques rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{requests.length}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {requests.filter(r => !r.is_read).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Non lus</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {requests.filter(r => r.replied_at).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Répondu</div>
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
                placeholder="Rechercher un message, nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
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
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(value) => setFilter(value as any)}
                className="p-1.5 bg-white/10 rounded-xl border border-white/20"
              >
                {[
                  { value: 'all', label: 'Tous', icon: Mail },
                  { value: 'unread', label: 'Non lus', icon: AlertCircle },
                  { value: 'replied', label: 'Répondu', icon: CheckCircle },
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
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* 🔹 Liste des messages - Design moderne et engageant */}
        {paginatedRequests.length === 0 ? (
          <Card className="glass-card border border-dashed border-cyan-500/20 bg-cyan-900/5">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Mail className="relative w-16 h-16 text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'unread' 
                  ? 'Aucun message non lu' 
                  : filter === 'replied'
                  ? 'Aucun message répondu'
                  : 'Aucun message trouvé'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter !== 'all' 
                  ? 'Essayez de changer les filtres pour voir plus de messages.'
                  : 'Il n\'y a aucun message de contact pour le moment.'}
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedRequests.map((req) => {
              const isExpanded = expandedRequests.has(req.id);
              const isReplied = !!req.replied_at;
              
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                  className={isReplied ? '' : 'relative before:content-[""] before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-cyan-400/30 before:animate-pulse'}
                >
                  <Card 
                    className={`
                      glass-card border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300
                      ${isReplied 
                        ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/15' 
                        : 'hover:border-cyan-500/40 hover:shadow-cyan-500/15'
                      }
                      hover:shadow-2xl
                    `}
                  >
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-xl relative overflow-hidden">
                            <div className={`absolute inset-0 ${isReplied ? 'bg-emerald-500/10' : 'bg-cyan-500/10'} rounded-xl`}></div>
                            <User className="w-6 h-6 text-cyan-400 relative z-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-xl font-bold text-white">
                                {req.name}
                              </CardTitle>
                              {getStatusBadge(req.is_read, req.replied_at)}
                            </div>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-cyan-300">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{req.email}</span>
                              </div>
                              {req.phone && (
                                <div className="flex items-center gap-1.5 text-gray-400 mt-1 sm:mt-0">
                                  <span className="hidden sm:inline">•</span>
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{req.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                              <span>Pour</span>
                              <span className="font-medium text-gray-300">
                                {req.profiles?.full_name} (@{req.profiles?.username})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(req.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(req.id)}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Réduire
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Voir plus
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-5">
                      {/* 🔹 Message avec expansion fluide */}
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 80 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-1.5 bg-blue-500/15 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-blue-300" />
                            </div>
                            <div>
                              <p className="text-xs text-blue-300 font-medium mb-1">Message original</p>
                              <p className="text-gray-200 whitespace-pre-line">{req.message}</p>
                            </div>
                          </div>
                          
                          {isReplied && (
                            <div className="mt-4 pt-4 border-t border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-emerald-500/15 rounded-lg">
                                  <ReplyAll className="w-4 h-4 text-emerald-300" />
                                </div>
                                <div>
                                  <p className="text-xs text-emerald-300 font-medium mb-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Répondu le {new Date(req.replied_at!).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  <p className="text-emerald-200 italic">
                                    Une réponse a été envoyée à cet utilisateur
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* 🔹 Actions contextuelles */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          {!req.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(req.id)}
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              Marquer comme lu
                            </Button>
                          )}
                          
                          {!isReplied && (
                            <Button
                              onClick={() => {
                                setReplyingTo(req.id);
                                setReplyMessage(`Bonjour ${req.name},\n\nMerci pour votre message.\n\nCordialement,\nL'équipe LUVIKA`);
                              }}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
                            >
                              <ReplyAll className="w-3.5 h-3.5 mr-1.5" />
                              Répondre
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(req.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Supprimer
                          </Button>
                        </div>
                        
                        {isReplied && (
                          <div className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            <span>Réponse envoyée</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 🔹 Formulaire de réponse (conditionally rendered) */}
                      {replyingTo === req.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 p-4 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 rounded-xl"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <Send className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">Répondre à {req.name}</h4>
                              <p className="text-sm text-cyan-200 mt-0.5">
                                Destinataire: <span className="font-medium">{req.email}</span>
                              </p>
                            </div>
                          </div>
                          
                          <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Écrivez votre réponse ici..."
                            className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 mb-4 focus:ring-2 focus:ring-cyan-500/50"
                          />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-cyan-200/80 bg-cyan-500/10 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Votre réponse sera envoyée par email et archivée dans l'historique</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyMessage('');
                                }}
                                className="border-white/20 text-gray-300 hover:bg-white/10"
                              >
                                Annuler
                              </Button>
                              <Button
                                onClick={handleReply}
                                disabled={isSending || !replyMessage.trim()}
                                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md shadow-emerald-500/20"
                              >
                                {isSending ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Envoi en cours...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-1.5" />
                                    Envoyer la réponse
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
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
              <span className="font-medium text-cyan-400">{filteredAndSorted.length}</span> messages
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