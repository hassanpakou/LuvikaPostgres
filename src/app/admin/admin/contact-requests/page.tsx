// src/app/admin/admin/contact-requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Mail, Phone, MessageSquare, Eye, CheckCircle, X, Send,
  RefreshCw, AlertCircle, User, Clock, ReplyAll, Trash2,
  ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  replied_at?: string | null;
  profiles: { full_name: string; username: string } | null;
};

const ITEMS_PER_PAGE = 8;

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('contact_requests')
        .select('*, profiles!inner(id, full_name, username)')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    let result = requests.filter(req => {
      if (filter === 'unread' && req.is_read) return false;
      if (filter === 'replied' && !req.replied_at) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          req.name.toLowerCase().includes(term) ||
          req.email.toLowerCase().includes(term) ||
          req.message.toLowerCase().includes(term) ||
          req.profiles?.full_name?.toLowerCase().includes(term)
        );
      }
      return true;
    });
    return result;
  }, [requests, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [filter, search]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('contact_requests').update({ is_read: true }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    toast.success('Marqué comme lu');
  };

  const handleReply = async () => {
    if (!replyingTo || !replyMessage.trim()) return;
    setSending(true);
    try {
      const req = requests.find(r => r.id === replyingTo);
      const res = await fetch('/api/admin/contact-requests/reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: replyingTo, toEmail: req?.email, toName: req?.name, message: replyMessage }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.map(r => r.id === replyingTo ? { ...r, is_read: true, replied_at: new Date().toISOString() } : r));
      toast.success('Réponse envoyée');
      setReplyingTo(null);
      setReplyMessage('');
    } catch {
      toast.error('Erreur');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    const supabase = createClient();
    await supabase.from('contact_requests').delete().eq('id', id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Message supprimé');
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getStatusBadge = (req: ContactRequest) => {
    if (req.replied_at) {
      return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20"><CheckCircle className="w-3 h-3" />Répondu</span>;
    }
    if (req.is_read) {
      return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-blue-500/10 text-blue-300/60 border-blue-500/20"><Eye className="w-3 h-3" />Lu</span>;
    }
    return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20"><AlertCircle className="w-3 h-3" />Nouveau</span>;
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Messages</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} message{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['all', 'unread', 'replied'].map((v) => (
                <button key={v} onClick={() => setFilter(v as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                    filter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'all' ? 'Tous' : v === 'unread' ? 'Non lus' : 'Répondus'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher un message..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Mail className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun message trouvé</p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((req) => {
            const isExpanded = expanded.has(req.id);
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
                <div className="flex flex-col gap-3">
                  {/* Infos */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-cyan-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-white/70 font-medium">{req.name}</p>
                        {getStatusBadge(req)}
                      </div>
                      <p className="text-[11px] text-gray-400/50 font-light mt-0.5">{req.email}{req.phone && <> • {req.phone}</>}</p>
                      <p className="text-[10px] text-gray-500/40 font-light mt-0.5">
                        Pour {req.profiles?.full_name} • {new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Message expansible */}
                  <button onClick={() => toggleExpand(req.id)} className="flex items-center gap-1 text-[11px] text-gray-400/60 hover:text-white/70 font-light w-fit">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? 'Réduire' : 'Voir le message'}
                  </button>
                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-xs text-gray-300/70 font-light whitespace-pre-line">{req.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!req.is_read && (
                      <button onClick={() => markAsRead(req.id)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] text-blue-400/60 hover:text-blue-300/70 hover:bg-blue-500/[0.04] font-light rounded-lg transition-all">
                        <Eye className="w-3 h-3" />Lu
                      </button>
                    )}
                    {!req.replied_at && (
                      <button onClick={() => { setReplyingTo(req.id); setReplyMessage(`Bonjour ${req.name},\n\nMerci pour votre message.\n\nCordialement,\nL'équipe LUVIKA`); }}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg transition-all">
                        <ReplyAll className="w-3 h-3" />Répondre
                      </button>
                    )}
                    <button onClick={() => handleDelete(req.id)}
                      className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] font-light rounded-lg transition-all">
                      <Trash2 className="w-3 h-3" />Supprimer
                    </button>
                    {req.replied_at && (
                      <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-emerald-500/10 text-emerald-300/60 font-light rounded-lg">
                        <CheckCircle className="w-3 h-3" />Répondu
                      </span>
                    )}
                  </div>

                  {/* Formulaire réponse */}
                  <AnimatePresence>
                    {replyingTo === req.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/[0.08] space-y-2">
                          <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)}
                            rows={3} placeholder="Votre réponse..."
                            className="w-full text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl p-2.5 resize-none font-light placeholder:text-gray-500/40" />
                          <div className="flex gap-2">
                            <button onClick={() => { setReplyingTo(null); setReplyMessage(''); }}
                              className="flex-1 h-7 text-[11px] text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg transition-all">Annuler</button>
                            <button onClick={handleReply} disabled={sending || !replyMessage.trim()}
                              className="flex-1 h-7 text-[11px] bg-gradient-to-r from-emerald-600/80 to-cyan-600/80 text-white font-light rounded-lg transition-all disabled:opacity-50">
                              <Send className="w-3 h-3 mr-1" />{sending ? 'Envoi...' : 'Envoyer'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">Page {currentPage} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
              <Button key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${page === currentPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}