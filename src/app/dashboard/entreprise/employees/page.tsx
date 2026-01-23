// src/app/dashboard/entreprise/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { useTranslations } from 'next-intl';

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

      const {  data } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .order('joined_at', { ascending: false });

      setEmployees(data || []);
      setLoading(false);
    };

    fetchEmployees();
  }, []);

// ✅ Loader élégant
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Chargement...</h3>
          <p className="text-gray-400">Récupération des données depuis la base sécurisée</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
              <p className="text-gray-400 text-sm mt-1">{emp.email || emp.phone || '—'}</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
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