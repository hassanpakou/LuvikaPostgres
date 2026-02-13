// src/app/admin/admin/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Building, Users, Package, TrendingUp, BarChart3, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { createClient } from '../../../../src/lib/supabase/client';
import AdminActions from '../../../../components/admin/AdminActions';
import { createNotifier } from '../../../../src/lib/notify';
import { useTranslations } from 'next-intl';

type AdminStats = {
  totalEnterprises: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
};

export default function AdminDashboard() {
  const t = useTranslations(); // ✅ À L'INTÉRIEUR
  const notify = createNotifier(t); // ✅ À L'INTÉRIEUR
  
  const [stats, setStats] = useState<AdminStats>({
    totalEnterprises: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [
          { count: totalEnterprises },
          { count: totalEmployees },
          { count: totalOrders },
          { data: revenueData },
          { count: activeSubscriptions }
        ] = await Promise.all([
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('employees').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_revenue'),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('active', true)
        ]);

        setStats({
          totalEnterprises: totalEnterprises || 0,
          totalEmployees: totalEmployees || 0,
          totalOrders: totalOrders || 0,
          totalRevenue: revenueData?.[0]?.total || 0,
          activeSubscriptions: activeSubscriptions || 0
        });
      } catch (err) {
        console.error('❌ Erreur chargement stats admin:', err);
        notify.ServerError();
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/30 mb-4">
          <BarChart3 className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-3xl font-bold text-white">💼 Espace Administrateur</h1>
        <p className="text-gray-400 mt-2">
          Gérez les utilisateurs, abonnements, commandes NFC et plus encore.
        </p>
      </div>

      {/* 🔹 Statistiques clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard 
          icon={<Building className="w-6 h-6" />}
          title="Entreprises"
          value={stats.totalEnterprises}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          title="Employés"
          value={stats.totalEmployees}
          color="bg-cyan-500/20 text-cyan-400"
        />
        <StatCard 
          icon={<Package className="w-6 h-6" />}
          title="Commandes"
          value={stats.totalOrders}
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard 
          icon={<Wallet className="w-6 h-6" />}
          title="Revenus"
          value={`${stats.totalRevenue.toLocaleString()} $`}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          title="Abonnements"
          value={stats.activeSubscriptions}
          color="bg-violet-500/20 text-violet-400"
        />
      </div>

      {/* 🔹 Actions rapides */}
      <div className="mt-8">
        <AdminActions />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string; 
}) {
  return (
    <Card className="glass-border text-center p-4 md:p-6">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3 md:mb-4`}>
        {icon}
      </div>
      <p className="text-xs md:text-sm text-gray-400">{title}</p>
      <p className="text-lg md:text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}