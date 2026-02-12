// src/app/dashboard/orders/page.tsx
'use client'; // 🔹 requis pour useRouter, useState, etc.

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { Package, Clock, Truck, CheckCircle, AlertTriangle, X, Loader2 } from 'lucide-react';

// 🔹 Composant statut
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300', icon: Clock },
    processing: { label: 'En préparation', color: 'bg-blue-500/20 text-blue-300', icon: Package },
    shipped: { label: 'Expédiée', color: 'bg-cyan-500/20 text-cyan-300', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-500/20 text-red-300', icon: X },
  }[status] || { label: 'Inconnu', color: 'bg-gray-500/20 text-gray-300', icon: AlertTriangle };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

// 🔹 Composant modale simple
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15">
        <h3 className="text-lg font-bold text-white mb-2">Confirmer l’annulation</h3>
        <p className="text-gray-300 mb-6">
          Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
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
      // Nettoie l’URL
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
        setToast({ type: 'success', message: '✅ Commande annulée' });
      } else {
        const data = await res.json();
        setToast({ type: 'error', message: data.error || 'Échec annulation' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: 'Erreur réseau' });
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
    <div className="p-6 md:p-8 text-white relative">
      {/* 🔹 Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mes commandes</h1>
          <p className="text-gray-400 mt-1">
            Historique et suivi de vos commandes NFC
          </p>
        </div>
        {orders.length > 0 && (
          <a
            href="/dashboard/orders/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Package className="w-4 h-4" />
            Nouvelle commande
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-300">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucune commande</h2>
          <p className="text-gray-400 mb-6">
            Vous n’avez pas encore passé de commande NFC. Commencez dès maintenant !
          </p>
          <a
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Package className="w-4 h-4" />
            Commander une carte NFC
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-border bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{productLabels[order.product_type] || order.product_type}</h3>
                    <span className="text-gray-400">×{order.quantity}</span>
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="mt-3 md:mt-0 flex flex-col sm:flex-row sm:items-center gap-3">
                  <StatusBadge status={order.status} />
                  {order.shipping_address && (
                    <span className="text-xs text-gray-400 max-w-xs truncate sm:max-w-none">
                      📍 {order.shipping_address}
                    </span>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => setConfirmModal({ open: true, orderId: order.id })}
                      disabled={cancellingId === order.id}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 flex items-center gap-1"
                    >
                      {cancellingId === order.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, orderId: '' })}
        onConfirm={() => cancelOrder(confirmModal.orderId)}
        isLoading={cancellingId === confirmModal.orderId}
      />

      {/* 🔹 Bouton flottant mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <a
          href="/dashboard/orders/new"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Nouvelle commande"
        >
          <Package className="w-6 h-6 text-white" />
        </a>
      </div>
    </div>
  );
}