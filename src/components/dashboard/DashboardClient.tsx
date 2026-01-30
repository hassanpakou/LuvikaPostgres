// src/src/components/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../src/lib/supabase/client';
import DashboardContent from '../../../src/components/dashboard/DashboardContent';
import { generateQRBase64 } from '../../../lib/qr';

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
  const hasRedirected = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      try {
        // 🔹 ✅ UTILISE getUser() — validation côté serveur
        const { data : { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/auth/sign-in');
          }
          return;
        }

        setUser(authUser);

       // 🔹 ✅ CORRECTION CLÉ : syntaxe valide sans commentaires
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select(`
    *,
    nfc_cards(*)
  `)
  .eq('id', authUser.id)
  .single();

        // 🔹 ✅ Redirige vers /complete-profile si profil absent
        if (profileError || !profileData) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/complete-profile');
          }
          return;
        }

        // 🔹 ✅ Redirige si onboarding non terminé
        if (profileData.onboarding_done !== true) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/complete-profile');
          }
          return;
        }

        setProfile(profileData);

        // 🔹 Followers
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', authUser.id);
        setFollowers(count || 0);

        // 🔹 Scans
        const { data : scansData } = await supabase
          .from('scans')
          .select('*, profiles!left(username, full_name)')
          .eq('profile_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setScans(scansData || []);
        setTotalScans(scansData?.length || 0);

        // 🔹 ✅ Protection QR : vérifie que username existe
        if (profileData.username) {
          const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app')
            .trim()
            .replace(/\/+$/, '');
          const profileUrl = `${baseUrl}/${profileData.username}`;
          try {
            const qr = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
            setQrBase64(qr);
          } catch (err) {
            console.warn('⚠️ QR generation failed');
          }
        }

        setLoading(false);

        // 🔹 Realtime scans
        const realtimeChannel = supabase
          .channel(`scans-${authUser.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'scans',
            filter: `profile_id=eq.${authUser.id}`,
          }, async (payload) => {
            const newScan = payload.new as Scan;
            const { data : scannerProfile } = await supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', newScan.scanner_id)
              .single();
            newScan.profiles = scannerProfile || { username: 'inconnu', full_name: 'Utilisateur supprimé' };
            setScans(prev => [newScan, ...prev.slice(0, 4)]);
            setTotalScans(prev => prev + 1);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(realtimeChannel);
        };
      } catch (err) {
        console.error('❌ Erreur DashboardClient:', err);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/auth/sign-in');
        }
      }
    };

    init();
  }, [router]);

  // ✅ Loader élégant
  if (loading) {
    return (
  <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
    <div className="w-full max-w-md">

      {/* Bulle glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

        <div className="flex flex-col items-center text-center">

          {/* Boule circulaire */}
          <div className="relative w-20 h-20 mb-6">

            {/* Cercle externe */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>

            {/* Aiguille qui tourne */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
            </div>

            {/* Cœur lumineux */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-6 rounded-full bg-slate-950"></div>
          </div>

          {/* Texte */}
          <h3 className="text-lg font-semibold text-white mb-1">
            Chargement du profil…
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Récupération sécurisée des données
          </p>

          {/* Barre de progression */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
);

  }

  if (!profile) return null;

  const isAdmin = profile.role === 'admin';
  const cards = profile.nfc_cards || [];

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
      totalFollowers={followers}
      qrBase64={qrBase64}
      profileUrl={`https://luvika.me/${profile.username}`}
      planColors={PLAN_COLORS}
      isAdmin={isAdmin}
    />
  );
}