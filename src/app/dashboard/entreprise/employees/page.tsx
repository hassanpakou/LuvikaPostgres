// src/app/dashboard/entreprise/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { UserPlus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const t = useTranslations('enterprise.modules.employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .order('joined_at', { ascending: false });

      setEmployees(data || []);
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  const handleEdit = (employeeId: string) => {
    router.push(`/dashboard/entreprise/employees/${employeeId}/edit`);
  };

  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Supprimer ${employeeName} ? Cette action est irréversible.`)) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);
      
      if (error) throw error;
      
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      toast.success(`✅ Employé "${employeeName}" supprimé`);
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('❌ Erreur lors de la suppression');
    }
  };

  // ✅ Loader élégant
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-full max-w-md">
          {/* Bulle glassmorphism */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              {/* Boule circulaire */}
              <div className="relative w-20 h-20 mb-6">
                {/* Cercle externe */}
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                {/* Aiguille qui tourne */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
                </div>
                {/* Cœur lumineux */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full bg-slate-950"></div>
              </div>
              {/* Texte */}
              <h3 className="text-lg font-semibold text-white mb-1">
                Chargement du profil…
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Récupération des données depuis la base sécurisée
              </p>
              {/* Barre de progression */}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/entreprise')}
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button onClick={() => router.push('/dashboard/entreprise/employees/new')}>
          <UserPlus className="w-4 h-4 mr-2" /> {t('add_employee')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <Card key={emp.id} className="glass-border">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {emp.full_name}
                <Badge className={
                  emp.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                  emp.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-300'
                }>
                  {emp.role}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">{emp.position || '—'}</p>
              <p className="text-gray-400 text-sm mt-1">
                {emp.email || emp.phone || '—'}
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEdit(emp.id)}
                  className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => handleDelete(emp.id, emp.full_name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}