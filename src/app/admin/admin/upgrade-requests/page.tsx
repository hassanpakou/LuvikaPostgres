// src/app/(admin)/admin/upgrade-requests/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UpgradeRequestActions } from '../../../../../src/components/admin/UpgradeRequestActions';

type UpgradeRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_at: string | null;
  target_plan: string; // ✅ ajouté
  profiles: {
    full_name: string;
    username: string;
    email: string;
    plan: string; // ✅ ajouté
  } | null;
};

export default async function UpgradeRequestsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  // 🔹 Ajout de 'plan' et 'target_plan' dans la requête
  const { data: requests, error } = await supabase
    .from('upgrade_requests')
    .select(`
      *,
      profiles!inner (id, full_name, username, email, plan)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const t = await getTranslations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnu</span>;
    }
  };

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
          Demande de mise à niveau
        </h1>
        <p className="text-gray-400">
          Approuvez ou rejetez les demandes Premium/Entreprise.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune demande en attente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="glass-border">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {req.profiles?.full_name} (@{req.profiles?.username})
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{req.profiles?.email}</p>
                </div>
                {getStatusBadge(req.status)}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Demandée le</p>
                    <p className="text-gray-300">
                      {new Date(req.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Traitée le</p>
                    <p className="text-gray-300">
                      {req.processed_at 
                        ? new Date(req.processed_at).toLocaleDateString('fr-FR') 
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Notes</p>
                    <p className="text-gray-300 italic">
                      {req.admin_notes || 'Aucune'}
                    </p>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <UpgradeRequestActions 
                    id={req.id} 
                    currentPlan={req.profiles?.plan as 'basic' | 'premium'}
                    targetPlan={req.target_plan as 'entreprise'}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}