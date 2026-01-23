// src/app/(admin)/admin/events/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { ArrowLeft, QrCode, Calendar, MapPin, Eye } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_public: boolean;
  max_participants: number | null;
  qr_code_url: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
  } | null;
};

export default async function EventsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  const { data : events, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles!inner (id, full_name, username)
    `)
    .order('starts_at', { ascending: false });

  if (error) throw error;

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
          Événements
        </h1>
        <p className="text-gray-400">
          Gérez les événements et leurs QR codes.
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <QrCode className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucun événement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="glass-border">
              <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg font-semibold text-white">
                      {event.title}
                    </CardTitle>
                    {!event.is_public && (
                      <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 text-xs">
                        Privé
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    par {event.profiles?.full_name} (@{event.profiles?.username})
                  </p>
                </div>
                {event.qr_code_url && (
                  <a
                    href={event.qr_code_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    Voir QR
                  </a>
                )}
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-gray-300 mb-3 italic">"{event.description}"</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {event.starts_at && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Début
                      </p>
                      <p className="text-gray-300">
                        {new Date(event.starts_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {event.ends_at && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Fin
                      </p>
                      <p className="text-gray-300">
                        {new Date(event.ends_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {event.location && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Lieu
                      </p>
                      <p className="text-gray-300">{event.location}</p>
                    </div>
                  )}
                  {event.max_participants && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Places
                      </p>
                      <p className="text-gray-300">{event.max_participants} max</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}