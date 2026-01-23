// src/components/dashboard/AnalyticsChart.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ScanData = {
  date: string; // YYYY-MM-DD
  scans: number;
};

export default function AnalyticsChart({ profileId }: { profileId: string }) {
  const [data, setData] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7' | '30' | 'all'>('30');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const url = range === 'all'
          ? `/api/analytics/daily?profile_id=${profileId}`
          : `/api/analytics/daily?profile_id=${profileId}&days=${range}`;
        
        const res = await fetch(url);
        const scanData = await res.json();
        setData(scanData);
      } catch (err) {
        console.error('❌ Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [profileId, range]);

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Scans par jour',
        data: data.map(d => d.scans),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Activité récente' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { 
        ticks: { 
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    },
  };

  return (
    <Card className="glass-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>📊 Statistiques</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant={range === '7' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setRange('7')}
          >
            7j
          </Button>
          <Button 
            variant={range === '30' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setRange('30')}
          >
            30j
          </Button>
          <Button 
            variant={range === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setRange('all')}
          >
            Tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Chargement...</div>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucun scan récent.</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </CardContent>
    </Card>
  );
}