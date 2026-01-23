// src/components/product/ProductActions.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../src/lib/supabase/client';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Heart, ShoppingCart, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ProductActions({
  productId,
  locale,
}: {
  productId: string;
  locale: string;
}) {
  const t = useTranslations();
  const supabase = createClient();
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [company, setCompany] = useState<{ name: string; phone: string | null } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          name,
          price,
          promo_price,
          stock_quantity,
          companies!inner(name, phone)
        `)
        .eq('id', productId)
        .single();

      if (error || !product) return;

      setProductName(product.name);
      setPrice(product.price);
      setPromoPrice(product.promo_price);
      setStock(product.stock_quantity);

      const comp = Array.isArray(product.companies)
        ? product.companies[0]
        : product.companies;
      setCompany(comp || null);

      if (product.stock_quantity > 0) {
        setQuantity(Math.min(1, product.stock_quantity));
      }
    };
    init();
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();
      setIsFavorite(!!data);
    };
    checkFavorite();
  }, [user, productId]);

  const addToCart = async () => {
    if (stock !== null && quantity > stock) {
      toast.error(t('product.quantity_exceeds_stock'));
      return;
    }

    if (!user) {
      toast.error(t('auth.signin.title'));
      return;
    }

    setLoadingCart(true);
    try {
      const { data: existing } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabase
          .from('carts')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
      }

      toast.success(t('enterprise.modules.product.added_to_cart'));
    } catch (err) {
      console.error('Erreur panier:', err);
      toast.error(t('enterprise.modules.cart_error'));
    } finally {
      setLoadingCart(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error(t('auth.signin.title'));
      return;
    }

    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Erreur favori:', err);
      toast.error(t('product.favorite_error'));
    } finally {
      setLoadingFavorite(false);
    }
  };

  const orderViaWhatsApp = async () => {
    if (!company || !company.phone) {
      toast.error(t('product.no_whatsapp'));
      return;
    }

    if (stock !== null && quantity > stock) {
      toast.error(t('product.quantity_exceeds_stock'));
      return;
    }

    const cleanPhone = company.phone.replace(/\D/g, '');
    const finalPrice = promoPrice || price;
    const total = (finalPrice * quantity).toFixed(2);

    const message = encodeURIComponent(
      `Bonjour ${company.name},\n\n` +
      `Je souhaite commander :\n` +
      `- Produit : ${productName}\n` +
      `- Quantité : ${quantity}\n` +
      `- Stock actuel : ${stock}\n` +
      `- Prix unitaire : $${finalPrice}\n` +
      `- Total : $${total}\n\n` +
      `Merci de me confirmer la commande et la disponibilité.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const disabled = stock === null || company === null;
  const isVisitor = !user;
  const outOfStock = stock === 0;
  const lowStock = stock !== null && stock <= 5 && stock > 0;

  return (
    <div className="space-y-5 pt-4">
      {/* 🔢 Quantité */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Label htmlFor="quantity" className="text-sm text-gray-300 whitespace-nowrap">
          {t('enterprise.modules.product.quantity')}
        </Label>
        <div className="relative">
          <Input
            id="quantity"
            type="number"
            min="1"
            max={stock || 99}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.max(1, Math.min(val, stock || 99)));
            }}
            className="w-20 bg-white/8 backdrop-blur-lg border border-white/20 text-white placeholder:text-gray-400 rounded-xl py-2 px-3 transition-all hover:bg-white/10 focus:ring-2 focus:ring-cyan-500/50"
            disabled={disabled || outOfStock}
          />
          {lowStock && (
            <AlertCircle className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
          )}
        </div>
        {stock !== null && (
          <span className={`text-xs ${
            outOfStock ? 'text-red-400' : lowStock ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {outOfStock 
              ? t('enterprise.modules.product.out_of_stock')
              : t('enterprise.modules.product.in_stock', { count: stock })
            }
          </span>
        )}
      </div>

      {/* 🔘 Boutons — avec glassmorphism et animation */}
      <div className="flex gap-3">
        <Button
          onClick={addToCart}
          disabled={isVisitor || loadingCart || disabled || outOfStock}
          className={`
            flex-1 relative overflow-hidden group
            bg-gradient-to-r from-emerald-600/90 to-cyan-600/90
            hover:from-emerald-500 hover:to-cyan-500
            backdrop-blur-md border border-white/20
            text-white font-medium py-2.5 rounded-xl
            transition-all duration-300
            ${isVisitor || outOfStock ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-emerald-500/20'}
          `}
          title={isVisitor ? t('auth.signin.title') : outOfStock ? t('enterprise.modules.product.out_of_stock') : undefined}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('enterprise.modules.product.add_to_cart')}
          </div>
          {loadingCart && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFavorite}
          disabled={isVisitor || loadingFavorite}
          className={`
            w-12 h-12 rounded-xl backdrop-blur-md border
            transition-all duration-200 group
            ${isFavorite 
              ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' 
              : 'border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
            }
          `}
          title={isVisitor ? t('auth.signin.title') : isFavorite ? t('enterprise.modules.product.remove_favorite') : t('enterprise.modules.product.add_favorite')}
        >
          <Heart className={`w-5 h-5 transition-transform duration-200 ${isFavorite ? 'fill-current scale-110' : ''}`} />
          {loadingFavorite && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          )}
        </Button>
      </div>

      {/* 📲 Commander directement — bouton WhatsApp stylé */}
      <Button
        onClick={orderViaWhatsApp}
        disabled={disabled || outOfStock}
        className={`
          w-full py-3 font-medium rounded-xl
          bg-gradient-to-r from-green-600/90 to-emerald-600/90
          hover:from-green-500 hover:to-emerald-500
          backdrop-blur-md border border-white/20 text-white
          transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20
          ${outOfStock ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {t('enterprise.modules.product.order_now')}
        </div>
      </Button>
    </div>
  );
}