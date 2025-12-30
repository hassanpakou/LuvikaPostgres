// src/app/dashboard/orders/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, MapPin, QrCode } from 'lucide-react';

export default function NewOrderPage() {
  const t = useTranslations('dashboard.orders');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    product_type: 'nfc_premium',
    shipping_address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        router.push('/dashboard/orders?success=1');
      } else {
        alert(`❌ ${result.error || 'Échec'}`);
      }
    } catch (err) {
      alert('❌ Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="text-violet-400" /> Nouvelle commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Produit */}
            <div>
              <Label className="text-gray-300 mb-2 block">Produit</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, product_type: 'nfc_premium' })}
                  className={`p-4 rounded-xl border transition-colors ${
                    formData.product_type === 'nfc_premium'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="text-violet-400" size={18} />
                    <span className="font-medium text-white">NFC Premium</span>
                  </div>
                  <Badge variant="outline" className="text-xs">1 carte — 15 000 FC</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, product_type: 'nfc_enterprise' })}
                  className={`p-4 rounded-xl border transition-colors ${
                    formData.product_type === 'nfc_enterprise'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="text-emerald-400" size={18} />
                    <span className="font-medium text-white">NFC Entreprise</span>
                  </div>
                  <Badge variant="outline" className="text-xs">5 cartes — 50 000 FC</Badge>
                </button>
              </div>
            </div>

            {/* Quantité */}
            <div>
              <Label htmlFor="quantity" className="text-gray-300">
                Quantité
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={handleChange}
                className="bg-white/5 border-white/10"
              />
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="shipping_address" className="text-gray-300">
                Adresse de livraison
              </Label>
              <Textarea
                id="shipping_address"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="ex: 123 Avenue Lumumba, Kinshasa"
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                '✅ Commander'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}