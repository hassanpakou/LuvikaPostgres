// src/components/profile/PublicProfileClientWrapper.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import PublicProfileClient from '@/src/components/profile/PublicProfileClient';

export default function PublicProfileClientWrapper({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const router = useRouter();
  const realtimeChannels = useRef<any[]>([]);

  // 🔹 Fonction pour charger les stats initiales
  const fetchStats = async (supabase: any, profileId: string, userId: string | null) => {
    const [{ count: followersCount }, { count: followingCount }, { count: isFollowingCount }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', profileId),
      userId ? supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId) : Promise.resolve({ count: 0 }),
      userId ? supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('followed_id', profileId) : Promise.resolve({ count: 0 }),
    ]);

    setFollowers(followersCount || 0);
    setFollowing(followingCount || 0);
    setIsFollowing((isFollowingCount || 0) > 0);
  };

  // 🔹 Configuration Realtime
  const setupRealtime = useCallback((profileId: string, supabase: any, userId: string | null) => {
    // 🔸 Canal : mises à jour du profil
    const profileChannel = supabase
      .channel(`profile-${profileId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${profileId}`,
      }, (payload: { new: any }) => {
        setProfileData((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    // 🔸 Canal : changements de follows
    const followChannel = supabase
      .channel(`follows-${profileId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `followed_id=eq.${profileId}`,
      }, () => {
        fetchStats(supabase, profileId, userId);
      })
      .subscribe();

    realtimeChannels.current = [profileChannel, followChannel];
  }, []);

  useEffect(() => {
    const init = async () => {
      const { locale, username } = await params;
      const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
      if (!supported.includes(locale as any)) return notFound();

      const decodedUsername = decodeURIComponent(username).toLowerCase();
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setCurrentUser(user);

      // 🔹 Chargement initial du profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
            created_at,
          avatar_url,
          cover_url,
          plan,
          accepts_contact_requests,
          sections_visibility
        `)
        .ilike('username', decodedUsername.trim())
        .single();

      if (error || !profile) {
        console.error('❌ Profil introuvable:', { username: decodedUsername });
        return notFound();
      }

      const isOwner = user?.id === profile.id;
      const isAdmin = user?.user_metadata?.role === 'admin';
      if (!profile.is_public && !isOwner && !isAdmin) {
        router.push(`/${locale}/${username}/private`);
        return;
      }

      setProfileData(profile);
      await fetchStats(supabase, profile.id, user?.id || null);
      setLoading(false);

      // 🔹 🔁 Démarrage Realtime
      setupRealtime(profile.id, supabase, user?.id || null);
    };

    init();

    // 🔹 Nettoyage au démontage
    return () => {
      realtimeChannels.current.forEach(channel => {
        if (channel?.unsubscribe) channel.unsubscribe();
      });
      realtimeChannels.current = [];
    };
  }, [params, router, setupRealtime]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Profil introuvable
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={`bg-bubble-${i}`}
              className="absolute rounded-full bg-white/5 animate-pulse"
              style={{
                width: `${8 + Math.random() * 25}px`,
                height: `${8 + Math.random() * 25}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${10 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-4xl relative z-10">
        <PublicProfileClient
          profile={profileData}
          followers={followers}
          following={following}
          isOwner={currentUser?.id === profileData.id}
          isInitiallyFollowing={isFollowing}
          currentUserId={currentUser?.id || null}
          onFollowChange={(newCount: number, isNowFollowing: boolean) => {
            setFollowers(newCount);
            setIsFollowing(isNowFollowing);
          }}
        />
      </div>
    </div>
  );
}