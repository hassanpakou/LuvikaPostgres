// src/app/dashboard/entreprise/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Clock, UserCheck, Calendar, ArrowLeft } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { Button } from '../../../../../components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { exportAttendanceLogs } from '../../../../../src/lib/utils/exportCSV';
import { isThisMonth, isToday } from '../../../../../src/lib/utils/stats';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const t = useTranslations('enterprise.modules.attendance');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayPresent: 0,
    todayLate: 0,
    monthTotal: 0
  });
  const router = useRouter();
  const supabase = createClient();

  // 🔹 1er useEffect : Récupération initiale des logs
  useEffect(() => {
    const fetchAttendance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      setCompanyId(company.id);

      const { data } = await supabase
        .from('attendance_logs')
        .select('*, employees(full_name)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setLogs(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, []);

  // 🔹 2ème useEffect : Écoute temps réel
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('attendance-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'attendance_logs',
        filter: `company_id=eq.${companyId}`
      }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
        
        // 🔊 Alert sonore
        if (typeof window !== 'undefined') {
          const audio = new Audio('/sounds/alert.mp3');
          audio.volume = 0.5;
          audio.play().catch(err => console.log('Audio play failed:', err));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  // 🔹 Calcul des stats
  useEffect(() => {
    if (logs.length === 0) return;

    const todayLogs = logs.filter(log => isToday(log.created_at));
    const monthLogs = logs.filter(log => isThisMonth(log.created_at));

    setStats({
      todayPresent: todayLogs.filter(l => l.status === 'present').length,
      todayLate: todayLogs.filter(l => l.status === 'late').length,
      monthTotal: monthLogs.length
    });
  }, [logs]);

  // ✅ Loader élégant
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
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
              <h3 className="text-lg font-semibold text-white mb-1">
                Chargement du profil…
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Récupération des données depuis la base sécurisée
              </p>
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
        <Button onClick={() => exportAttendanceLogs(logs)} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-border text-center p-6">
          <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Présents aujourd'hui</p>
          <p className="text-2xl font-bold text-white">
            {stats.todayPresent}
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">En retard aujourd'hui</p>
          <p className="text-2xl font-bold text-white">
            {stats.todayLate}
          </p>
        </Card>
        <Card className="glass-border text-center p-6">
          <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Présences ce mois-ci</p>
          <p className="text-2xl font-bold text-white">
            {stats.monthTotal}
          </p>
        </Card>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            {t('recent_logs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 glass-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{log.employees?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(log.created_at), 'dd MMMM yyyy, HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <Badge className={
                  log.status === 'present' ? 'bg-green-500/20 text-green-300' :
                  log.status === 'late' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }>
                  {log.status === 'present' ? 'Présent' : log.status === 'late' ? 'En retard' : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}