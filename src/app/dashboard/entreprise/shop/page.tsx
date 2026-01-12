// src/app/dashboard/entreprise/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ShopPage() {
  const t = useTranslations('enterprise.modules.shop');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchShopData = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupère l'entreprise de l'utilisateur
      const { data : company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      // Récupère les produits
      const {  data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', company.id)
        .order('created_at', { ascending: false });

      setProducts(data || []);
      setLoading(false);

      // 🔹 Realtime
      const channel = supabase
        .channel(`products-${company.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `seller_id=eq.${company.id}` }, () => {
          fetchShopData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    fetchShopData();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button onClick={() => router.push('/dashboard/entreprise/shop/new')}>
          <Plus className="w-4 h-4 mr-2" /> {t('new_product')}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="glass-border text-center py-12">
          <p className="text-gray-400">{t('no_products')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id} className="glass-border">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">{product.description?.slice(0, 80)}...</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">
                    {product.promo_price ? `${product.promo_price} $` : `${product.price} $`}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.stock_quantity > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {product.stock_quantity} en stock
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {/* 🔜 À activer quand /p/[slug] sera prêt */}
<Button
  variant="ghost"
  size="sm"
  onClick={() => {
    const locale = localStorage.getItem('NEXT_LOCALE') || 'fr';
    window.open(`/${locale}/p/${product.slug}`, '_blank');
  }}
  title={t('view_product')}
>
  <Eye className="w-4 h-4 text-cyan-400" />
</Button>
<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/entreprise/shop/${product.id}/edit`)}>
  <Edit className="w-4 h-4" />
</Button>
<Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
  <Trash2 className="w-4 h-4" />
</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}