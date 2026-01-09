// src/app/dashboard/entreprise/shop/[id]/edit.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { 
  Save, X, Image as ImageIcon, Tag, Package, DollarSign, RotateCcw 
} from 'lucide-react';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promo_price: number | null;
  stock_quantity: number;
  sku: string;
  images: string[];
  is_active: boolean;
};

export default function EditProductPage() {
  const t = useTranslations('enterprise.shop');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    promo_price: null,
    stock_quantity: 0,
    sku: '',
    images: [],
    is_active: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const supabase = createClient();

  // 🔹 Charger le produit
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const { data : { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data : company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!company) return;

        const {  data } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('seller_id', company.id)
          .single();

        if (data) {
          setProduct(data);
          if (data.images?.[0]) {
            setImagePreview(data.images[0]);
          }
        }
      } catch (err) {
        console.error('❌ Chargement produit échoué:', err);
        toast.error(t('load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 🔹 Gestion des inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // 🔹 Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_image'));
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(t('image_too_large'));
      return;
    }

    try {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setImagePreview(publicUrl);
      setProduct(prev => ({ ...prev, images: [publicUrl] }));
    } catch (err) {
      console.error('❌ Upload échoué:', err);
      toast.error(t('upload_error'));
    }
  };

  // 🔹 Sauvegarder
  const handleSave = async () => {
    if (!productId || !product.name || !product.slug) {
      toast.error(t('missing_fields'));
      return;
    }

    setSaving(true);
    try {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          slug: product.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description: product.description,
          price: Number(product.price),
          promo_price: product.promo_price ? Number(product.promo_price) : null,
          stock_quantity: Number(product.stock_quantity),
          sku: product.sku,
          images: product.images,
          is_active: product.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('seller_id', company.id);

      if (error) throw error;

      toast.success(t('save_success'));
      router.push('/dashboard/entreprise/shop');
    } catch (err) {
      console.error('❌ Sauvegarde échouée:', err);
      toast.error(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Supprimer
  const handleDelete = async () => {
    if (!confirm(t('delete_confirm'))) return;

    try {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', company.id);

      if (error) throw error;

      toast.success(t('delete_success'));
      router.push('/dashboard/entreprise/shop');
    } catch (err) {
      console.error('❌ Suppression échouée:', err);
      toast.error(t('delete_error'));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-gray-400">Chargement du produit...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t('edit_title')}</h1>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <X className="w-4 h-4 mr-1" />
          {t('cancel')}
        </Button>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('product_info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4" />
              {t('image')}
            </Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="w-24 h-24 object-cover rounded-lg border border-white/10"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-800 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="mb-2"
                />
                <p className="text-xs text-gray-400">{t('image_help')}</p>
              </div>
            </div>
          </div>

          {/* Nom & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={product.name || ''}
                onChange={handleChange}
                placeholder={t('name_placeholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">{t('slug')}</Label>
              <div className="relative">
                <Input
                  id="slug"
                  name="slug"
                  value={product.slug || ''}
                  onChange={handleChange}
                  placeholder={t('slug_placeholder')}
                  required
                />
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                URL: /{product.slug || '...'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              placeholder={t('description_placeholder')}
              rows={4}
            />
          </div>

          {/* Prix & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {t('price')}
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={product.price || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="promo_price">{t('promo_price')}</Label>
              <Input
                id="promo_price"
                name="promo_price"
                type="number"
                min="0"
                step="0.01"
                value={product.promo_price || ''}
                onChange={handleChange}
                placeholder={t('optional')}
              />
            </div>
            <div>
              <Label htmlFor="stock_quantity" className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {t('stock')}
              </Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={product.stock_quantity || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <Label htmlFor="sku">{t('sku')}</Label>
            <Input
              id="sku"
              name="sku"
              value={product.sku || ''}
              onChange={handleChange}
              placeholder={t('sku_placeholder')}
            />
            <p className="text-xs text-gray-400 mt-1">{t('sku_help')}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('saving') : t('save')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/entreprise/shop')}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex-1"
            >
              {t('delete')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}