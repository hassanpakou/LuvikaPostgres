// src/app/dashboard/entreprise/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Plus, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function ShopPage() {
  const t = useTranslations('enterprise.modules.shop');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchShopData = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🔑 Récupère le username du profil
      const { data : profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
        console.log("✅ Username chargé :", profile.username); // ← Diagnostic ajouté
      } else {
        console.warn("⚠️ Aucun username trouvé pour l'utilisateur", user.id);
      }

      // Récupère l'entreprise
      const { data : company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      // Récupère les produits
      const { data } = await supabase
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

  const handleShareShop = () => {
    if (!username) {
      toast.error("Impossible de générer le lien");
      console.error("❌ Username manquant, impossible de partager");
      return;
    }
    const locale = localStorage.getItem('NEXT_LOCALE') || 'fr';
    const url = `${window.location.origin}/${locale}/shop/${username}`;
    navigator.clipboard.writeText(url);
    toast.success("✅ Lien de la boutique copié !");
  };

// ✅ Loader élégant
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Chargement...</h3>
          <p className="text-gray-400">Récupération des données depuis la base sécurisée</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔝 En-tête avec bouton Partager */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShareShop}
            disabled={!username}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager la boutique
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard/entreprise/shop/new')}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-2.5 px-4 rounded-xl backdrop-blur-md border border-white/10 shadow-lg shadow-cyan-500/10 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('new_product')}
          </Button>
        </div>
      </div>

      {/* 📦 Produits */}
      {products.length === 0 ? (
        <Card className="glass-border border border-dashed border-white/10 bg-white/5 backdrop-blur-xl text-center py-16">
          <p className="text-gray-400 text-lg">{t('no_products')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card 
              key={product.id} 
              className="glass-border overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <CardHeader>
                <CardTitle className="text-white group-hover:text-cyan-300 transition-colors">
                  {product.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {product.description?.slice(0, 80) || 'Aucune description'}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">
                    {product.promo_price ? `${product.promo_price} $` : `${product.price} $`}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock_quantity > 0 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {product.stock_quantity} en stock
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <div className="flex justify-end gap-2 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const locale = localStorage.getItem('NEXT_LOCALE') || 'fr';
                      window.open(`/${locale}/p/${product.slug}`, '_blank');
                    }}
                    className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-lg"
                    title={t('view_product')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/entreprise/shop/${product.id}/edit`)}
                    className="text-gray-400 hover:bg-white/10 hover:text-white rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}