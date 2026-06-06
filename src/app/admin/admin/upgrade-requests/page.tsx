// src/app/admin/admin/upgrade-requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, Clock, CheckCircle, XCircle, User, Mail,
  Calendar, TrendingUp, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type UpgradeRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_at: string | null;
  target_plan: string;
  profiles: { full_name: string; username: string; email: string; plan: string; role?: string } | null;
};

const ITEMS_PER_PAGE = 8;

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('upgrade_requests')
        .select('*, profiles!inner(id, full_name, username, email, plan, role)')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    let result = requests.filter(req => {
      if (filter !== 'all' && req.status !== filter) return false;
      if (search) {
        const term = search.toLowerCase();
        const p = req.profiles;
        if (!p) return false;
        return (p.full_name?.toLowerCase().includes(term) || p.username?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term));
      }
      return true;
    });
    return result;
  }, [requests, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [filter, search]);

  const handleAction = async (id: string, action: 'approved' | 'rejected', label: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success(`Demande ${label.toLowerCase()}`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action, processed_at: new Date().toISOString() } : r));
    } catch {
      toast.error('Erreur');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      pending: { icon: <Clock className="w-3 h-3" />, className: 'bg-yellow-500/10 text-yellow-300/60 border-yellow-500/20', label: 'En attente' },
      approved: { icon: <CheckCircle className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20', label: 'Approuvée' },
      rejected: { icon: <XCircle className="w-3 h-3" />, className: 'bg-red-500/10 text-red-300/60 border-red-500/20', label: 'Rejetée' },
    };
    const c = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${c.className}`}>
        {c.icon}{c.label}
      </span>
    );
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
            <h1 className="text-xl font-semibold text-white/80">Demandes de mise à niveau</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
            {['all', 'pending', 'approved', 'rejected'].map((v) => (
              <button key={v} onClick={() => setFilter(v as any)}
                className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                  filter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                }`}>{v === 'all' ? 'Toutes' : v === 'pending' ? 'En attente' : v === 'approved' ? 'Approuvées' : 'Rejetées'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <TrendingUp className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((req) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-cyan-400/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white/70 font-medium">{req.profiles?.full_name || 'Inconnu'}</p>
                      {getStatusBadge(req.status)}
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-purple-500/10 text-purple-300/60 border-purple-500/20">
                        <TrendingUp className="w-3 h-3" />{req.target_plan}
                      </span>
                      {req.profiles?.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-amber-500/10 text-amber-300/60 border-amber-500/20">
                          <ShieldCheck className="w-3 h-3" />Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400/50 font-light mt-0.5">{req.profiles?.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500/50 font-light">
                      <span>{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                      {req.processed_at && <span>• Traitée le {new Date(req.processed_at).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    {req.admin_notes && <p className="text-[10px] text-gray-500/40 font-light mt-0.5 italic">Note: {req.admin_notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 lg:ml-4">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(req.id, 'approved', 'Approuvée')} disabled={processingId === req.id}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white font-light rounded-lg transition-all disabled:opacity-50">
                        {processingId === req.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Approuver
                      </button>
                      <button onClick={() => handleAction(req.id, 'rejected', 'Rejetée')} disabled={processingId === req.id}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] border border-red-500/[0.15] text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] font-light rounded-lg transition-all disabled:opacity-50">
                        {processingId === req.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}Rejeter
                      </button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-emerald-500/10 text-emerald-300/60 font-light rounded-lg">
                      <CheckCircle className="w-3 h-3" />Approuvée
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-red-500/10 text-red-300/60 font-light rounded-lg">
                      <XCircle className="w-3 h-3" />Rejetée
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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