//src/app/dashboard/entreprise/employees/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import { Button } from '../../../../../../../components/ui/button';
import { Input } from '../../../../../../../components/ui/input';
import { Label } from '../../../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../components/ui/select';
import { Textarea } from '../../../../../../../components/ui/textarea';
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function EditEmployeePage() {
  const t = useTranslations('enterprise.modules.employees');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const employeeId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    role: 'employee',
    status: 'active'
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) {
        router.push('/dashboard');
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('company_id', company.id)
        .single();

      if (error || !data) {
        toast.error('Employé non trouvé');
        router.push('/dashboard/entreprise/employees');
        return;
      }

      setEmployee({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        role: data.role || 'employee',
        status: data.status || 'active'
      });

      setLoading(false);
    };

    fetchEmployee();
  }, [employeeId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) throw new Error('Entreprise non trouvée');

      const { error } = await supabase
        .from('employees')
        .update({
          full_name: employee.full_name.trim(),
          email: employee.email.trim(),
          phone: employee.phone.trim(),
          position: employee.position.trim(),
          role: employee.role,
          status: employee.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)
        .eq('company_id', company.id);

      if (error) throw error;

      toast.success('✅ Employé mis à jour avec succès');
      router.push('/dashboard/entreprise/employees');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
                </div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full bg-slate-950"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Chargement...</h3>
              <p className="text-sm text-gray-400 mb-5">Récupération des données de l'employé</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la liste
      </Button>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="text-white font-bold">Modifier l'employé</div>
              <div className="text-sm text-gray-400">Mettez à jour les informations</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom complet *
                </Label>
                <Input
                  id="full_name"
                  value={employee.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={employee.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@entreprise.com"
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={employee.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+243 ..."
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Poste */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-gray-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Poste
                </Label>
                <Input
                  id="position"
                  value={employee.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Développeur, Manager, etc."
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Rôle */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rôle *
                </Label>
                <Select
                  value={employee.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger id="role" className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">👑 Administrateur</SelectItem>
                    <SelectItem value="manager">👔 Manager</SelectItem>
                    <SelectItem value="employee">👤 Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Statut *</Label>
                <Select
                  value={employee.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status" className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ Actif</SelectItem>
                    <SelectItem value="inactive">⏸️ Inactif</SelectItem>
                    <SelectItem value="suspended">⚠️ Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}