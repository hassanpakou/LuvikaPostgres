// src/app/(admin)/admin/orders/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderActions } from './_components/OrderActions'; // ✅ Import client-safe
import { Package, ArrowLeft } from 'lucide-react';

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  const { data : orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (full_name, username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur fetch orders:', error);
    throw error;
  }

  const t = await getTranslations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">En attente</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">En cours</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">Expédié</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Livré</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnu</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.nav.back_to_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-white">
          {t('admin.orders.title')}
        </h1>
        <p className="text-gray-400">{t('admin.orders.subtitle')}</p>
      </div>

      {orders.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('admin.orders.no_orders')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-border">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {order.profiles?.full_name} (@{order.profiles?.username})
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{order.profiles?.email}</p>
                </div>
                {getStatusBadge(order.status)}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Quantité</p>
                    <p className="font-medium text-white">{order.quantity} carte(s)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Adresse</p>
                    <p className="text-gray-300">{order.shipping_address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-gray-300">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* ✅ Remplacé par le composant client */}
                <OrderActions orderId={order.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}