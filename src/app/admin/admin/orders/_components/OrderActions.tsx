// src/app/(admin)/admin/orders/_components/OrderActions.tsx
'use client';

import { Button } from '../../../../../../components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function OrderActions({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string; 
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' 
}) {
  const router = useRouter();

  const updateStatus = async (newStatus: string, actionName: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(`✅ ${actionName} effectuée`);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(`❌ ${data.error || 'Action échouée'}`);
      }
    } catch (error) {
      toast.error('❌ Erreur de connexion');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 mt-4">
      {currentStatus === 'pending' && (
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          onClick={() => updateStatus('processing', 'Validation')}
        >
          <CheckCircle className="h-4 w-4 mr-1" /> Valider
        </Button>
      )}
      
      {currentStatus === 'processing' && (
        <>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            onClick={() => updateStatus('shipped', 'Expédition')}
          >
            <Truck className="h-4 w-4 mr-1" /> Expédier
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => updateStatus('cancelled', 'Annulation')}
          >
            <XCircle className="h-4 w-4 mr-1" /> Annuler
          </Button>
        </>
      )}
      
      {currentStatus === 'shipped' && (
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          onClick={() => updateStatus('delivered', 'Confirmation de livraison')}
        >
          <CheckCircle className="h-4 w-4 mr-1" /> Confirmer livraison
        </Button>
      )}
      
      {['processing', 'shipped', 'delivered', 'cancelled'].includes(currentStatus) && (
        <Button 
          size="sm" 
          variant="outline"
          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          onClick={() => updateStatus('pending', 'Réinitialisation')}
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Réinitialiser
        </Button>
      )}
    </div>
  );
}