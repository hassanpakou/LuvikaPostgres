// src/app/dashboard/entreprise/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('enterprise.modules.settings');
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
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
          address: data.address || ''
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
      await supabase
        .from('companies')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      alert(t('save_success'));
    } catch (err) {
      console.error(err);
      alert(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label>{t('phone')}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>{t('address')}</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? t('saving') : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}