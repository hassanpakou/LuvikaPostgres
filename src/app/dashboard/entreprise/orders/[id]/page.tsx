// src/app/dashboard/entreprise/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrderDetailPage() {
  const t = useTranslations('enterprise.modules.orders');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data } = await supabase
        .from('ecommerce_orders')
        .select(`
          *,
          buyer:profiles!ecommerce_orders_buyer_id_fkey(*),
          seller:companies(*)
        `)
        .eq('id', orderId)
        .eq('seller_id', company.id)
        .single();

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div>Chargement...</div>;
  if (!order) return <div>Commande non trouvée</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="glass-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commande #{order.id.slice(0, 8)}</span>
              <Badge className={
                order.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                order.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                'bg-gray-500/20 text-gray-300'
              }>
                {order.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Client</h3>
              <p>{order.buyer?.full_name || order.buyer_name || 'Anonyme'}</p>
              <p className="text-sm text-gray-400">{order.buyer?.email || order.buyer_email || '—'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Adresse de livraison</h3>
              <p className="text-sm text-gray-400">{order.shipping_address || 'Non spécifiée'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Articles</h3>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300">
                {JSON.stringify(order.items || [], null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Résumé */}
        <Card className="glass-border">
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-white">{order.total_amount.toLocaleString()} $</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span>{format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Heure</span>
              <span>{format(new Date(order.created_at), 'HH:mm', { locale: fr })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}