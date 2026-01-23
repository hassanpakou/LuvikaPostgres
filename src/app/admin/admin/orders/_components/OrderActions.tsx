// src/app/(admin)/admin/orders/_components/OrderActions.tsx
'use client';

import { Button } from '../../../../../../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();

  const handleValidate = async () => {
    const res = await fetch(`/api/admin/orders/${orderId}/validate`, { method: 'POST' });
    if (res.ok) router.refresh(); // ✅ Rafraîchit les données côté serveur (SSR)
  };

  const handleCancel = async () => {
    if (!confirm('Annuler cette commande ?')) return;
    const res = await fetch(`/api/admin/orders/${orderId}/cancel`, { method: 'POST' });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-500" onClick={handleValidate}>
        <CheckCircle className="h-4 w-4 mr-1" /> Valider
      </Button>
      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={handleCancel}>
        <XCircle className="h-4 w-4 mr-1" /> Annuler
      </Button>
    </div>
  );
}