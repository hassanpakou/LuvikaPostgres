// src/app/(admin)/admin/analytics/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Users, Scan, Package } from 'lucide-react';

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  // ✅ Stats agrégées
  const [
    { count: userCount },
    { count: scanCount },
    { count: orderCount },
    { count: nfcCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('nfc_cards').select('*', { count: 'exact', head: true }),
  ]);

  const t = await getTranslations();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.nav.back_to_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-white">
          {t('admin.modules.analytics.title')}
        </h1>
        <p className="text-gray-400">
          {t('admin.modules.analytics.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.total_users')}</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.total_scans')}</CardTitle>
            <Scan className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{scanCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.orders')}</CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{orderCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('admin.stats.nfc_cards')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{nfcCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('admin.analytics.recent_activity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">{t('admin.analytics.coming_soon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}