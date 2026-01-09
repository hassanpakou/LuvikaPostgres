// src/app/dashboard/entreprise/shop/new.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function NewProductPage() {
  const t = useTranslations('enterprise.shop');
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    promo_price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error(t('max_5_images'));
      return;
    }
    setImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Récupère l'entreprise
      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) throw new Error('Company not found');

      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages(user.id);
        setUploading(false);
      }

      // Crée le produit
      const { error } = await supabase
        .from('products')
        .insert({
          seller_id: company.id,
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          promo_price: formData.promo_price ? parseFloat(formData.promo_price) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          sku: formData.sku.trim() || null,
          category_id: formData.category_id || null,
          images: imageUrls,
          is_active: true,
        });

      if (error) throw error;

      toast.success(t('create_success'));
      router.push('/dashboard/entreprise/shop');
    } catch (err) {
      console.error('❌ Création échouée:', err);
      toast.error(t('create_error'));
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t('new_product')}</h1>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('product_info')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                {t('images')}
              </Label>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover rounded-lg border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    aria-label="Supprimer l’image"
>
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label
  className="w-20 h-20 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5"
>
  <span className="sr-only">Ajouter des images du produit</span>

  <Plus className="w-6 h-6 text-gray-400" />

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageChange}
    className="hidden"
    aria-describedby="product-images-help"
  />
</label>

                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('image_help_multi')}</p>
            </div>

            {/* Champs texte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">{t('slug')}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">{t('price')}</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="promo_price">{t('promo_price')}</Label>
                <Input
                  id="promo_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.promo_price}
                  onChange={(e) => setFormData({...formData, promo_price: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">{t('stock')}</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">{t('sku')}</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              disabled={saving || uploading || !formData.name || !formData.price}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500"
            >
              {saving ? t('saving') : uploading ? t('uploading') : t('create_product')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}