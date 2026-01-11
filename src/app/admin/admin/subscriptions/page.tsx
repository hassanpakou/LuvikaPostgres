import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { SubscriptionActions } from '@/components/admin/SubscriptionActions';

type Subscription = {
  id: string;
  plan: 'basic' | 'premium' | 'entreprise';
  active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  profiles: {
    full_name: string;
    username: string;
    email: string;
  } | null;
};

export default async function SubscriptionsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  const { data : subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      profiles!left (id, full_name, username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur fetch subscriptions:', error);
    throw new Error('Échec du chargement des abonnements');
  }

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
          {t('admin.modules.subscriptions.title')}
        </h1>
        <p className="text-gray-400">
          {t('admin.modules.subscriptions.description')}
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('admin.subscriptions.no_active')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="glass-border">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {sub.profiles?.full_name} (@{sub.profiles?.username})
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{sub.profiles?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  sub.active 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {sub.active ? t('admin.subscription.active') : t('admin.subscription.inactive')}
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.subscription.plan')}</p>
                    <p className="font-medium text-white capitalize">
                      {t(`admin.plans.${sub.plan}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.subscription.activated')}</p>
                    <p className="text-gray-300">
                      {sub.activated_at ? new Date(sub.activated_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.subscription.expires')}</p>
                    <p className={sub.expires_at ? 'text-gray-300' : 'text-yellow-400'}>
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : t('admin.subscription.never')}
                    </p>
                  </div>
                </div>

                <SubscriptionActions id={sub.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}