// src/app/dashboard/entreprise/employees/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function AddEmployeePage() {
  const t = useTranslations('enterprise.modules.employees');
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    role: 'employee',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Récupérer l'entreprise de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) throw new Error('Entreprise introuvable');

      // Insérer l'employé
      const { error } = await supabase
        .from('employees')
        .insert({
          company_id: company.id,
          full_name: formData.full_name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          position: formData.position.trim() || null,
          role: formData.role,
        });

      if (error) throw error;

      toast.success(t('add_success'));
      router.push('/dashboard/entreprise/employees');
    } catch (err) {
      console.error('Erreur ajout employé:', err);
      toast.error(t('add_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="text-white">{t('add_employee')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-gray-200">
                {t('full_name')}
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder={t('full_name_placeholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('email_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-200">
                {t('phone')}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t('phone_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-200">
                {t('position')}
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder={t('position_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-200">
                {t('role')}
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">{t('roles.employee')}</SelectItem>
                  <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t('adding') : t('confirm_add')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}