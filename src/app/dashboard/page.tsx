// src/app/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateQRBase64 } from '@/lib/qr'; // ✅ Ajouté
import DashboardContent from '../../components/dashboard/DashboardContent';

const formatDistance = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffHrs > 0) return `${diffHrs} heure${diffHrs > 1 ? 's' : ''}`;
  if (diffMin > 0) return `${diffMin} min`;
  return `${diffSec} sec`;
};

const PLAN_COLORS = {
  freemium: 'bg-gray-500',
  basic: 'bg-gray-500',
  premium: 'bg-blue-500',
  entreprise: 'bg-purple-500',
  business: 'bg-purple-500',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.id) redirect('/auth/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/complete-profile');

  const isAdmin = profile.role === 'admin';


  const { data : subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const finalSubscription = subscription || { plan: 'freemium', active: false, expires_at: null };

  const { data : cards } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('user_id', user.id);

  const { data : scans, count: totalScans } = await supabase
    .from('scans')
    .select('*, profiles!left(username, full_name)', { count: 'exact' })
    .eq('profile_id', user.id)
    .limit(5);

  const { count: likesCount } = await supabase
    .from('profile_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('type', 'like');

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL.trim() 
      : 'https://luvika.vercel.app'
  ).replace(/\/$/, ''); // ✅ Supprime le / final

  if (!baseUrl || !baseUrl.startsWith('http')) {
    console.error('🔧 NEXT_PUBLIC_SITE_URL manquant ou invalide');
    redirect('/error?code=CONFIG');
  }

  const profileUrl = `${baseUrl}/${profile.username}`;

  // ✅ Génération côté serveur — une seule fois
  let qrBase64 = '';
  try {
    qrBase64 = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
  } catch (err) {
    console.warn('⚠️ QR generation failed — fallback to empty');
  }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      subscription={finalSubscription}
      cards={cards || []}
      recentScans={(scans || []).map(scan => ({
        ...scan,
        relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
        profiles: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
      }))}
      totalScans={totalScans || 0}
      qrBase64={qrBase64} // ✅ UNIQUEMENT ICI — pas de doublon
      profileUrl={profileUrl}
      planColors={PLAN_COLORS}
      likesCount={likesCount || 0}
      isAdmin={isAdmin}
    />
  );
}