// src/app/(admin)/admin/contact-requests/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MessageSquare, Eye, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  profiles: {
    full_name: string;
    username: string;
  } | null;
};

export default async function ContactRequestsPage() {
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

  const { data : requests, error } = await supabase
    .from('contact_requests')
    .select(`
      *,
      profiles!inner (id, full_name, username)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const t = await getTranslations();

  const markAsRead = async (id: string) => {
    const res = await fetch(`/api/admin/contact-requests/${id}/read`, {
      method: 'POST',
    });
    if (res.ok) location.reload();
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
          Messages visiteurs
        </h1>
        <p className="text-gray-400">
          Gérez les demandes de contact des profils publics.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucun message</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="glass-border">
              <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{req.name}</h3>
                    {!req.is_read && (
                      <Badge className="bg-cyan-500/20 text-cyan-300 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Nouveau
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {req.email} {req.phone && `• ${req.phone}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Pour {req.profiles?.full_name} (@{req.profiles?.username})
                  </p>
                </div>
                {!req.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                    onClick={() => markAsRead(req.id)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Marquer lu
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {new Date(req.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-gray-200 whitespace-pre-line">{req.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}