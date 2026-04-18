//src/app/dashboard/entreprise/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Package, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useSoundNotification } from '../../../../../src/hooks/useSoundNotification';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Button } from '../../../../../components/ui/button';
import { Download } from 'lucide-react';
import { exportOrders } from '../../../../../src/lib/utils/exportCSV';
import { filterByDateRange, calculateStats } from '../../../../../src/lib/utils/stats';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const t = useTranslations('enterprise.modules.orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const supabase = createClient();
  const { playSound } = useSoundNotification();
  const router = useRouter();

  // 🔹 useEffect : Récupération initiale
  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      setCompanyId(company.id);

      const { data } = await supabase
        .from('ecommerce_orders')
        .select(`
          *,
          buyer:profiles!ecommerce_orders_buyer_id_fkey(full_name, email),
          seller:companies(name, logo_url)
        `)
        .eq('seller_id', company.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🔹 useEffect : Écoute temps réel NOUVELLES COMMANDES
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('ecommerce-orders-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'ecommerce_orders',
        filter: `seller_id=eq.${companyId}`
      }, (payload) => {
        setOrders(prev => [payload.new, ...prev]);
        playSound();
        
        // Notification toast
        if (window.location.pathname.includes('/dashboard/entreprise/orders')) {
          toast.success(`🔔 Nouvelle commande ! ${payload.new.total_amount} $`, {
            duration: 5000,
            icon: '🛒'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, playSound]);

  // 🔹 Filtres et stats
  const filteredOrders = filterByDateRange(orders, dateRange);
  const stats = calculateStats(filteredOrders);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success('✅ Statut mis à jour');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/entreprise')}
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-36 bg-white/5 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportOrders(orders)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-border text-center p-6">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-white">
            {stats.revenue.toLocaleString()} $
          </p>
          <p className="text-xs text-gray-500 mt-1">({dateRange})</p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">En attente</p>
          <p className="text-2xl font-bold text-white">
            {stats.pending}
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Livrées</p>
          <p className="text-2xl font-bold text-white">
            {stats.delivered}
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Moyenne</p>
          <p className="text-2xl font-bold text-white">
            {stats.average.toFixed(0)} $
          </p>
        </Card>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('recent_orders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.slice(0, 10).map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 glass-border rounded-lg">
                <div>
                  <p className="text-white font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">
                    {order.buyer?.full_name || order.buyer_name || 'Client anonyme'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{(order.total_amount || 0).toLocaleString()} $</p>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32 mt-1 bg-white/5 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">🕗 En attente</SelectItem>
                      <SelectItem value="processing">⚙️ En cours</SelectItem>
                      <SelectItem value="shipped">🚚 Expédiée</SelectItem>
                      <SelectItem value="delivered">✅ Livrée</SelectItem>
                      <SelectItem value="cancelled">❌ Annulée</SelectItem>
                    </SelectContent>
                  </Select>
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