// src/app/dashboard/entreprise/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Clock, UserCheck } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
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