// src/app/[locale]/shop/[username]/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  stock_quantity: number;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export default async function PublicShopPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  if (!['fr', 'en', 'ln'].includes(locale)) {
    return notFound();
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return notFound();

  const { data : company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('owner_id', profile.id)
    .single();

  if (!company) return notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', company.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const t = (key: string) => {
    const translations: Record<string, any> = {
      fr: {
        shop_title: `Boutique de`,
        no_products: "Aucun produit disponible pour le moment",
        in_stock: "en stock",
        view_product: "Voir le produit"
      },
      en: {
        shop_title: `Shop of`,
        no_products: "No products available yet",
        in_stock: "in stock",
        view_product: "View product"
      },
      ln: {
        shop_title: `Butik ya`,
        no_products: "Aza na biloko eza te",
        in_stock: "na stock",
        view_product: "Monana biloko"
      }
    };
    return translations[locale]?.[key] || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">{t('shop_title')} {company.name}</h1>
          <p className="text-gray-400 mt-2">
            Découvrez les produits de {company.name}
          </p>
        </div>

        {/* ✅ Gestion sécurisée de products */}
        {(!products || products.length === 0) ? (
          <Card className="glass-border border border-dashed border-white/10 bg-white/5 backdrop-blur-xl text-center py-16">
            <p className="text-gray-400 text-lg">{t('no_products')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <Card 
                key={product.id} 
                className="glass-border overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-white">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description?.slice(0, 80) || 'Aucune description'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-400">
                      ${product.promo_price || product.price}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock_quantity > 0 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {product.stock_quantity} {t('in_stock')}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-lg w-full"
                  >
                    <Link href={`/${locale}/p/${product.slug}`} target="_blank">
                      <Eye className="w-4 h-4 mr-2" />
                      {t('view_product')}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}