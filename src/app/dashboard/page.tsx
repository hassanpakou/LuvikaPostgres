// src/app/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
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

  // ✅ 1. user → .data.user
const { data : { user } } = await supabase.auth.getUser();
  if (!user || !user.id) {
    redirect('/auth/sign-in');
  }

  // ✅ 2. profile → .data
  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileResult.error || !profileResult.data) {
    redirect('/complete-profile');
  }
  const profile = profileResult.data;

  // ✅ 3. subscription → .data
  const subResult = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  const subscription = subResult.data || { plan: 'freemium', active: false };

  // ✅ 4. cards → .data
  const cardsResult = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('user_id', user.id);
  const cards = cardsResult.data || [];

  // ✅ 5. scans → .data + .count
  const scansResult = await supabase
    .from('scans')
    .select('*, profiles!left(username, full_name)', { count: 'exact' })
    .eq('profile_id', user.id)
    .limit(5);

  // ✅ 6. likes → .count
const likesResult = await supabase
  .from('profile_interactions')
  .select('*', { count: 'exact', head: true })
  .eq('profile_id', user.id)
  .eq('type', 'like');

const likesCount = likesResult?.count || 0;


  const profileUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').trim()}/${profile.username}`;
  let qrBase64 = '';
  try {
    qrBase64 = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
  } catch (err) {
    console.warn('⚠️ QR fallback');
  }

  const t = await getTranslations();

  return (
    <DashboardContent
      t={t}
      user={user}
      profile={profile}
      subscription={subscription}
      cards={cards}
      recentScans={
        (scansResult.data || []).map(scan => ({
          ...scan,
          relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
          profile: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
        }))
      }
      totalScans={scansResult.count || 0}
      qrBase64={qrBase64}
      profileUrl={profileUrl}
      planColors={PLAN_COLORS}
      likesCount={likesCount || 0}
    />
  );
}