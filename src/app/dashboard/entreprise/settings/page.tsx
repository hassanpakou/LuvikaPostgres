// src/app/dashboard/entreprise/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Globe, LinkIcon, Building2, Mail, Phone, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function SettingsPage() {
  const t = useTranslations('enterprise.modules.settings');
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    website: '',
    description: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCompany = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const {  data } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setCompany(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          website: data.website || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
        });
      }
      setLoading(false);
    };

    fetchCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          website: formData.website.trim(),
          description: formData.description.trim(),
          logo_url: formData.logo_url.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id);

      if (error) throw error;

      toast.success(t('save_success'));
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      toast.error(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-400 flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        {t('loading')}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            {t('company_info')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom */}
            <div>
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t('name')}
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('email')}
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Téléphone */}
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('phone')}
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {/* Adresse */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('address')}
              </Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            {/* Ville */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('city')}
              </Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            {/* Pays */}
            <div>
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('country')}
              </Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>

            {/* Site web */}
            <div>
              <Label className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                {t('website')}
              </Label>
              <Input
                type="url"
                placeholder="https://exemple.com"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>

            {/* Description */}
            <div>
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('description')}
              </Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Logo URL (optionnel) */}
            <div>
              <Label>{t('logo_url')}</Label>
              <Input
                type="url"
                placeholder="https://exemple.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
              {saving ? t('saving') : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}