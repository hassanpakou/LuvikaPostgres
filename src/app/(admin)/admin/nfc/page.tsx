// src/app/(admin)/admin/nfc/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Smartphone, ArchiveX } from 'lucide-react';

export default async function NfcPage() {
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

  const { data: cards, error } = await supabase
    .from('nfc_cards')
    .select(`
      *,
      profiles (full_name, username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const t = await getTranslations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Active</span>;
      case 'lost': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Perdue</span>;
      case 'blocked': return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">Bloquée</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">Inconnue</span>;
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
          {t('admin.modules.nfc.title')}
        </h1>
        <p className="text-gray-400">
          {t('admin.modules.nfc.description')}
        </p>
      </div>

      {cards.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('admin.nfc.no_cards')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id} className="glass-border">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {card.profiles?.full_name} (@{card.profiles?.username})
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{card.card_id}</p>
                </div>
                {getStatusBadge(card.status)}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.nfc.status')}</p>
                    <p className="font-medium text-white">
                      {t(`admin.nfc.status.${card.status}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.nfc.activated')}</p>
                    <p className="text-gray-300">
                      {card.activated_at ? new Date(card.activated_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.nfc.created')}</p>
                    <p className="text-gray-300">
                      {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {card.status !== 'blocked' && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm rounded-lg hover:opacity-90"
                    onClick={async () => {
                      if (confirm('Bloquer cette carte ?')) {
                        await fetch(`/api/admin/nfc/${card.id}/block`, { method: 'POST' });
                        window.location.reload();
                      }
                    }}
                  >
                    <ArchiveX className="w-4 h-4" /> {t('admin.nfc.block_card')}
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}