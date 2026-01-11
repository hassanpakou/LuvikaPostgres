// src/src/components/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import DashboardContent from '@/src/components/dashboard/DashboardContent';
import { generateQRBase64 } from '@/lib/qr';

type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profile_id: string;
  scanner_id?: string;
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
};

export default function DashboardClient() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let realtimeChannel: any = null;

    const init = async () => {
      // 🔹 Auth
      const {  { session } } = await supabase.auth.getSession();
      if (!session?.user) return router.push('/auth/sign-in');
      setUser(session.user);

      // 🔹 Profil (sans nfc_cards)
      const {  profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('❌ Profil introuvable');
        return router.push('/auth/sign-in');
      }

      // 🔹 ✅ VÉRIFICATION UNIQUE : profil complet ?
      if (!profileData.onboarding_done) {
        return router.push('/auth/complete');
      }

      setProfile(profileData);

      // 🔹 Followers
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', session.user.id);
      setFollowers(count || 0);

      // 🔹 Scans
      const {  scansData } = await supabase
        .from('scans')
        .select('*, profiles!left(username, full_name)')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setScans(scansData || []);
      setTotalScans(scansData?.length || 0);

      // 🔹 QR
      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app').replace(/\/+$/, '');
      const profileUrl = `${baseUrl}/${profileData.username}`;
      try {
        const qr = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
        setQrBase64(qr);
      } catch (err) {
        console.warn('⚠️ QR generation failed');
      }

      setLoading(false);

      // 🔹 🔁 Realtime scans
      realtimeChannel = supabase
        .channel(`scans-${session.user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
          filter: `profile_id=eq.${session.user.id}`,
        }, async (payload) => {
          const newScan = payload.new as Scan;
          const {  scannerProfile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', newScan.scanner_id)
            .single();
          newScan.profiles = scannerProfile || { username: 'inconnu', full_name: 'Utilisateur supprimé' };
          setScans(prev => [newScan, ...prev.slice(0, 4)]);
          setTotalScans(prev => prev + 1);
        })
        .subscribe();
    };

    init();

    return () => {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement…</div>;
  if (!profile) return null;

  const isAdmin = profile.role === 'admin';
  // ✅ Pas de chargement de nfc_cards ici → inutile pour le dashboard principal

  return (
    <DashboardContent
      user={user}
      profile={profile}
      cards={[]} // ✅ Vide par défaut — les cartes ne sont pas nécessaires ici
      recentScans={scans.map(scan => ({
        ...scan,
        relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
        profiles: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
      }))}
      totalScans={totalScans}
      totalFollowers={followers}
      qrBase64={qrBase64}
      profileUrl={`https://luvika.me/${profile.username}`}
      planColors={PLAN_COLORS}
      isAdmin={isAdmin}
    />
  );
}
