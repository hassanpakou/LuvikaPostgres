// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClientForPage } from '../../lib/supabase/server';
import DashboardContent from '../../components/dashboard/DashboardContent';
import { generateQRBase64 } from '@/lib/qr';


type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
  };
};

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
  const supabase = await createClientForPage();

  // 🔹 ✅ Étape 1 : récupérer la session avec refresh (clé anti-boucle)
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session?.user) {
    console.warn('🚨 Aucune session valide — redirection vers /auth/sign-in');
    return redirect('/auth/sign-in');
  }

  // 🔹 ✅ Étape 2 : refresh pour forcer l’ID à jour
  await supabase.auth.refreshSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    console.warn('🚨 user.id manquant après refresh — déconnexion forcée');
    return redirect('/auth/sign-out?reason=session_invalid');
  }

  // 🔹 ✅ Étape 3 : récupérer le profil SANS relations d’abord (plus fiable)
  const { data: profileBase } = await supabase
    .from('profiles')
    .select('id, username, full_name, onboarding_done, plan, likes_count, role')
    .eq('id', user.id)
    .single();

  // 🔹 ✅ Vérification robuste
  const isProfileComplete = 
    profileBase?.onboarding_done === true &&
    typeof profileBase.username === 'string' &&
    profileBase.username.trim().length >= 3 &&
    typeof profileBase.full_name === 'string' &&
    profileBase.full_name.trim().length >= 2;

  console.log('🔍 Dashboard check:', {
    user_id: user.id,
    profile_id: profileBase?.id,
    username: profileBase?.username,
    onboarding_done: profileBase?.onboarding_done,
    isProfileComplete,
  });

  if (!isProfileComplete) {
    console.warn('🚨 Profil incomplet ou absent — redirection vers /complete-profile');
    return redirect('/complete-profile');
  }
// 🔹 Récupérer le nombre total de followers pour l'utilisateur connecté
// 🔹 ✅ Compte des abonnés (followers)
// 🔹 ✅ Compte les followers (ceux qui suivent l'utilisateur)
const { count: totalFollowers } = await supabase
  .from('follows')
  .select('*', { count: 'exact', head: true })
  .eq('followed_id', user.id);

  // 🔹 ✅ Étape 4 : charger les relations seulement si profil OK
  const { data: profileWithRelations } = await supabase
    .from('profiles')
    .select(`
      *,
      plan,
      likes_count,
      nfc_cards!inner(*),
      scans:scans!inner(*, profiles!left(username, full_name))
    `)
    .eq('id', user.id)
    .single();

  const profile = profileWithRelations || profileBase;

  const isAdmin = profile.role === 'admin';
  const cards = profile.nfc_cards || [];
  const scans: Scan[] = (profile.scans || []).slice(0, 5);
  const totalScans = profile.scans?.length || 0;

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://luvika.vercel.app'
  ).replace(/\/+$/, '');

  if (!baseUrl || !baseUrl.startsWith('http')) {
    console.error('🔧 NEXT_PUBLIC_SITE_URL manquant ou invalide');
    return redirect('/error?code=CONFIG');
  }

  const profileUrl = `${baseUrl}/${profile.username}`;
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
    cards={cards}
    recentScans={scans.map(scan => ({
      ...scan,
      relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
      profiles: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
    }))}
    totalScans={totalScans}
    totalFollowers={0}  // <-- ajouté
    qrBase64={qrBase64}
    profileUrl={profileUrl}
    planColors={PLAN_COLORS}
    isAdmin={isAdmin}
  />
);
}