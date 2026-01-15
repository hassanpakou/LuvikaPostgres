// src/app/(admin)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Building, Users, Package, TrendingUp, BarChart3, Wallet 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/src/lib/supabase/client';
import AdminActions from '@/components/admin/AdminActions';
import { AdminSidebar } from '@/src/components/admin/AdminSidebar';
import { useAdminLayout } from '@/src/contexts/AdminLayoutContext';

type AdminStats = {
  totalEnterprises: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
};

export default function AdminDashboard() {
  const { isSidebarCollapsed } = useAdminLayout();
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
          enterprisesRes,
          employeesRes,
          ordersRes,
          revenueRes,
          subscriptionsRes
        ] = await Promise.all([
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('employees').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_revenue'),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('active', true)
        ]);

        setStats({
          totalEnterprises: enterprisesRes.count || 0,
          totalEmployees: employeesRes.count || 0,
          totalOrders: ordersRes.count || 0,
          totalRevenue: revenueRes.data?.[0]?.total || 0,
          activeSubscriptions: subscriptionsRes.count || 0
        });
      } catch (err) {
        console.error('❌ Erreur chargement stats admin:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Calcule la marge dynamique
  const contentMargin = isSidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <>
      <AdminSidebar />
      
      {/* Contenu principal avec marge dynamique */}
      <main className={`${contentMargin} pt-20 min-h-screen transition-all duration-500`}>
        <div className="space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/30 mb-4">
              <BarChart3 className="w-8 h-8 text-purple-300" />
            </div>
            <h1 className="text-3xl font-bold text-white">💼 Espace Administrateur</h1>
            <p className="text-gray-400 mt-2">
              Gérez les utilisateurs, abonnements, commandes NFC et plus encore.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <StatCard 
                icon={<Building className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Entreprises"
                value={stats.totalEnterprises}
                color="bg-blue-500/20 text-blue-400"
                className="min-w-[220px] flex-shrink-0 sm:min-w-auto"
              />
              <StatCard 
                icon={<Users className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Employés"
                value={stats.totalEmployees}
                color="bg-cyan-500/20 text-cyan-400"
                className="min-w-[220px] flex-shrink-0 sm:min-w-auto"
              />
              <StatCard 
                icon={<Package className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Commandes"
                value={stats.totalOrders}
                color="bg-amber-500/20 text-amber-400"
                className="min-w-[220px] flex-shrink-0 sm:min-w-auto"
              />
              <StatCard 
                icon={<Wallet className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Revenus"
                value={`${stats.totalRevenue.toLocaleString()} $`}
                color="bg-emerald-500/20 text-emerald-400"
                className="min-w-[220px] flex-shrink-0 sm:min-w-auto"
              />
              <StatCard 
                icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Abonnements"
                value={stats.activeSubscriptions}
                color="bg-violet-500/20 text-violet-400"
                className="min-w-[220px] flex-shrink-0 sm:min-w-auto"
              />
            </div>
          </div>

          <div className="mt-8">
            <AdminActions />
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ icon, title, value, color, className }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string; 
  className?: string;
}) {
  return (
    <Card className={`glass-border text-center p-4 sm:p-6 md:p-6 ${className || ''} hover:scale-105 transition-transform duration-300`}>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl ${color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
        {icon}
      </div>
      <p className="text-sm sm:text-base md:text-sm lg:text-base text-gray-400">{title}</p>
      <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}