// src/app/dashboard/entreprise/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // ✅ CORRECT POUR date-fns v2/v3
import { useTranslations } from 'next-intl';

export default function AttendancePage() {
  const t = useTranslations('enterprise.modules.attendance');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data } = await supabase
        .from('attendance_logs')
        .select('*, employees(full_name)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setLogs(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            {t('recent_logs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 glass-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-white">{log.employees?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">
{format(new Date(log.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <Badge className={
                  log.status === 'present' ? 'bg-green-500/20 text-green-300' :
                  log.status === 'late' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}