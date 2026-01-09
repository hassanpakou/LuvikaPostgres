// src/app/dashboard/entreprise/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // ✅ CORRECT POUR date-fns v2/v3
import { useTranslations } from 'next-intl';

export default function OrdersPage() {
  const t = useTranslations('enterprise.modules.orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const {  data } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .eq('seller_id', company.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-border text-center p-6">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-gray-400">{t('total_revenue')}</p>
          <p className="text-2xl font-bold text-white">
            {orders
              .filter(o => o.status === 'delivered')
              .reduce((sum, o) => sum + (o.total_amount || 0), 0)
              .toLocaleString()} $
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-gray-400">{t('pending_orders')}</p>
          <p className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Package className="w-8 h-8 text-violet-400 mx-auto mb-2" />
          <p className="text-gray-400">{t('completed_orders')}</p>
          <p className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </Card>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('recent_orders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 glass-border rounded-lg">
                <div>
                  <p className="text-white">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">{order.profiles?.full_name || 'Client anonyme'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{(order.total_amount || 0).toLocaleString()} $</p>
                  <Badge className={
                    order.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                  }>
                    {order.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
{format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}