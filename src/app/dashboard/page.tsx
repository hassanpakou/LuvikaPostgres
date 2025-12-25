// src/app/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { generateQRBase64 } from '@/lib/qr';
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

  // ✅ CORRECTION 1 : getUser() au lieu de getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    notFound();
  }

  const [profileRes, subRes, cardsRes, scansRes, likesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('nfc_cards').select('*').eq('user_id', user.id),
    supabase
      .from('scans')
      .select('*, profiles!left(username, full_name)', { count: 'exact' }) // ✅ CORRECTION 2 : !left
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profile_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .eq('type', 'like'),
  ]);

  if (profileRes.error) throw profileRes.error;

  const profile = profileRes.data;
  const subscription = subRes.data || { plan: 'basic', active: false };
  const cards = cardsRes.data || [];
  const recentScans = scansRes.data || [];
  const totalScans = scansRes.count || 0;
  const likesCount = likesRes.count || 0;

  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app'}/${profile.username}`;
  
  let qrBase64 = '';
  try {
    qrBase64 = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
  } catch (err) {
    console.error('Erreur génération QR', err);
  }

  const planColors = {
    basic: 'bg-gray-500',
    premium: 'bg-blue-500',
    entreprise: 'bg-purple-500',
  };

  const t = await getTranslations();

  return (
    <DashboardContent
      t={t}
      user={user}
      profile={profile}
      subscription={subscription}
      cards={cards}
      recentScans={recentScans.map(scan => ({
        ...scan,
        // Gère les scans sans profil (ex: utilisateur supprimé)
        relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
        profile: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
      }))}
      totalScans={totalScans}
      qrBase64={qrBase64}
      profileUrl={profileUrl}
      planColors={planColors}
      likesCount={likesCount}
    />
  );
}