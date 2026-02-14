'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Loader2 
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type AnalyticsData = {
  configured: boolean;
  summary?: {
    totalUsers: number;
    totalPageViews: number;
    avgSessionDuration: number;
    avgBounceRate: number;
    period: string;
  };
  daily?: Array<{
    date: string;
    activeUsers: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    newUsers: number;
  }>;
  error?: string;
};

export function GoogleAnalyticsCard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics/google', {
        next: { revalidate: 3600 }, // Cache 1h
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erreur ${res.status}`);
      }
      
      const result: AnalyticsData = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('Erreur chargement Analytics:', err);
      setError(err.message || 'Impossible de charger les données Google Analytics');
      setData({ configured: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Rafraîchissement automatique toutes les 2h
    const interval = setInterval(fetchAnalytics, 7200000);
    return () => clearInterval(interval);
  }, []);

  // 🔒 Google Analytics non configuré
  if (data?.configured === false && !loading) {
    return (
      <Card className="glass-border bg-amber-900/20 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            Google Analytics non configuré
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-200 mb-4">
            Pour afficher les statistiques Google Analytics, configurez les variables d'environnement :
          </p>
          <ul className="text-amber-100 text-sm space-y-2 ml-4 list-disc">
            <li><code>GOOGLE_ANALYTICS_PROPERTY_ID</code> : Votre Property ID Google Analytics</li>
            <li><code>GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY</code> : Clé JSON du compte de service</li>
          </ul>
          <a 
            href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-cyan-300 hover:text-cyan-200 underline text-sm"
          >
            → Guide de configuration officiel
          </a>
        </CardContent>
      </Card>
    );
  }

  // 🔄 Chargement
  if (loading || !data?.summary) {
    return (
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Google Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 📊 Données formatées pour les graphiques
  const chartData = {
    labels: data.daily?.map(d => 
      format(new Date(`${d.date.slice(0,4)}-${d.date.slice(4,6)}-${d.date.slice(6,8)}`), 'dd MMM', { locale: fr })
    ) || [],
    datasets: [
      {
        label: 'Utilisateurs actifs',
        data: data.daily?.map(d => d.activeUsers) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Pages vues',
        data: data.daily?.map(d => d.pageViews) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#cbd5e1' } },
      tooltip: { backgroundColor: 'rgba(30, 41, 59, 0.9)', titleColor: '#f1f5f9', bodyColor: '#cbd5e1' },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
    },
  };

  return (
    <Card className="glass-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Google Analytics
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">{data.summary.period}</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </CardHeader>
      
      <CardContent>
        {/* 🔹 Statistiques clés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-gray-400">Utilisateurs</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.summary.totalUsers.toLocaleString('fr-FR')}</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-gray-400">Pages vues</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.summary.totalPageViews.toLocaleString('fr-FR')}</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-gray-400">Session</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(data.summary.avgSessionDuration)}s
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">Bounce Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.summary.avgBounceRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* 🔹 Graphique d'activité */}
        <div className="h-80">
          {data.daily && data.daily.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Aucune donnée disponible pour la période sélectionnée</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}