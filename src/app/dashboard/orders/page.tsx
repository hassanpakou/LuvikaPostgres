// src/app/dashboard/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Package as PackageIcon, Clock, Truck, CheckCircle, AlertTriangle, X, Loader2, Sparkle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// 🔹 Composant statut amélioré
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
    processing: { label: 'En préparation', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: PackageIcon },
    shipped: { label: 'Expédiée', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: X },
  }[status] || { label: 'Inconnu', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: AlertTriangle };

  const Icon = config.icon;

  return (
    <Badge className={`px-3 py-1.5 text-xs font-medium border ${config.color} flex items-center gap-1.5`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
};

// 🔹 Composant modale améliorée
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-2xl rounded-2xl w-full max-w-md p-6 border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-900/10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="mt-1 p-3 bg-amber-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmation d'annulation</h3>
              <p className="text-amber-200">
                Êtes-vous absolument certain de vouloir annuler cette commande ? 
                <br />
                <span className="text-sm mt-2 block font-medium">
                  ⚠️ Cette action est irréversible et libérera le stock pour d'autres clients.
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Annulation...
                </>
              ) : (
                'Confirmer l\'annulation'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function UserOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; orderId: string }>({ open: false, orderId: '' });

  // 🔹 Récupère les commandes côté client
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/user/orders');
        if (!res.ok) throw new Error('Erreur réseau');
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error('❌ Erreur:', err);
        setError(err.message || 'Impossible de charger les commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // 🔹 Toast de succès si redirect avec ?success=1
    if (searchParams.get('success') === '1') {
      setToast({ type: 'success', message: '✅ Commande passée avec succès !' });
      // Nettoie l'URL
      router.replace('/dashboard/orders');
    }
  }, [router, searchParams]);

  // 🔹 Annule une commande
  const cancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setOrders(prev =>
          prev.map(order => 
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        setToast({ type: 'success', message: '✅ Commande annulée avec succès' });
      } else {
        const data = await res.json();
        setToast({ type: 'error', message: data.error || 'Échec de l\'annulation' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: 'Erreur réseau lors de l\'annulation' });
    } finally {
      setCancellingId(null);
      setConfirmModal({ open: false, orderId: '' });
    }
  };

  // 🔹 Traduction produit
  const productLabels: Record<string, string> = {
    nfc_premium: 'Carte NFC Premium',
    nfc_enterprise: 'Pack NFC Entreprise',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br to-indigo-900/10 py-8 px-4 sm:px-6 lg:px-8">
      {/* 🔹 Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '100%' }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: '100%' }}
            className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-2xl border ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/15 text-red-300 border-red-500/30'
            } shadow-lg shadow-black/30`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* 🔹 Header avec titre et CTA */}
        <div className="flex flex-col gap-4 mb-8">
  {/* Ligne supérieure : bouton retour seul */}
  <div className="flex items-center gap-3">
    <Button 
      variant="ghost" 
      onClick={() => router.back()} 
      className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors px-3 py-2"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Retour
    </Button>
    <div className="h-6 w-px bg-white/10"></div>
    <span className="text-xs text-gray-400">Mes commandes</span>
  </div>

  {/* Titre et CTA sur la même ligne sur desktop, empilés sur mobile */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">
        Mes commandes
      </h1>
      <p className="text-gray-300 text-sm flex items-center gap-2 flex-wrap">
        <PackageIcon className="w-4 h-4 text-violet-400 shrink-0" />
        <span className="break-words">Historique et suivi de vos commandes NFC</span>
      </p>
    </div>
    
    {orders.length > 0 && (
      <Button
        onClick={() => router.push('/dashboard/orders/new')}
        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/20 transition-all duration-300 group shrink-0"
      >
        <PackageIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Nouvelle commande
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform hidden sm:inline" />
      </Button>
    )}
  </div>
</div>

        {/* 🔹 Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin animation-delay-200"></div>
              <div className="absolute inset-1 w-14 h-14 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin animation-delay-400"></div>
            </div>
          </div>
        ) : error ? (
          <Card className="glass-border bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-200 mb-1">Erreur de chargement</h3>
                <p className="text-amber-100/80">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Réessayer
                </Button>
              </div>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto py-16"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center">
                <PackageIcon className="w-12 h-12 text-violet-300" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 mb-3">
              Aucune commande pour le moment
            </h2>
            <p className="text-gray-300 max-w-md mx-auto mb-8">
              Vous n'avez pas encore passé de commande NFC. Commencez dès maintenant et 
              recevez votre carte en moins de 24h à Kinshasa !
            </p>
            
            <Button
              onClick={() => router.push('/dashboard/orders/new')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all duration-300 group"
            >
              <PackageIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Commander ma première carte
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="mt-12 pt-8 border-t border-white/10 max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  { icon: Clock, label: '24h', desc: 'Livraison express' },
                  { icon: MapPin, label: 'Kinshasa', desc: 'Zone de livraison' },
                  { icon: Sparkle, label: 'Premium', desc: 'Qualité garantie' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-bold text-white">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)] pr-2">
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * orders.indexOf(order) }}
                  className="glass-border bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Décoration hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
    <div className="flex items-start gap-3">
      <div className="p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl shrink-0">
        <PackageIcon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-bold text-white truncate max-w-[200px] sm:max-w-none">
            {productLabels[order.product_type] || order.product_type}
          </h3>
          <span className="text-gray-400 text-sm shrink-0">×{order.quantity}</span>
        </div>
        {order.shipping_address && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="break-words">{order.shipping_address}</span>
          </div>
        )}
      </div>
    </div>
    <div className="shrink-0">
      <StatusBadge status={order.status} />
    </div>
  </div>
  
  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
    <Clock className="w-3.5 h-3.5 shrink-0" />
    <span className="truncate">
      Commandée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  </div>
</div>
                    
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => setConfirmModal({ open: true, orderId: order.id })}
                        disabled={cancellingId === order.id}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1.5" />
                            Annuler
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      {/* 🔹 Bouton flottant mobile */}
      <AnimatePresence>
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 md:hidden z-40"
          >
            <Button
              onClick={() => router.push('/dashboard/orders/new')}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300"
              size="icon"
              aria-label="Nouvelle commande"
            >
              <PackageIcon className="w-6 h-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, orderId: '' })}
        onConfirm={() => cancelOrder(confirmModal.orderId)}
        isLoading={cancellingId === confirmModal.orderId}
      />
      
      {/* 🔹 Styles globaux */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes animation-delay-200 {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}

// 🔹 Icônes manquantes
import { ArrowRight } from 'lucide-react';