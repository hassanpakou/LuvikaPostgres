// src/components/profile/PublicProfileClientWrapper.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
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

  // 🔹 Mémoïsée pour éviter les re-souscriptions
  const setupRealtime = useCallback((profileId: string, supabase: any) => {
    // 🔹 Channel followers
    const followChannel = supabase
      .channel(`follows-${profileId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `followed_id=eq.${profileId}`,
      }, () => {
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', profileId)
          .then(({ count }: { count: number }) => setFollowers(count || 0));
      })
      .subscribe();

    // 🔹 Channel profil (bio, photo, sections_visibility…)
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

    return { followChannel, profileChannel };
  }, []);

  useEffect(() => {
    let followChannel: any = null;
    let profileChannel: any = null;

    const init = async () => {
      const { locale, username } = await params;
      if (!['fr', 'ln', 'en'].includes(locale)) return notFound();

      const decodedUsername = decodeURIComponent(username).toLowerCase();
      const supabase = createClient();

      // 🔹 Session
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setCurrentUser(user);

      // 🔹 Profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          plan,
          accepts_contact_requests,
          cover_url,
          sections_visibility
        `)
        .ilike('username', decodedUsername.trim())
        .single();

      if (error || !profile) {
        console.error('❌ Profil introuvable:', { username: decodedUsername });
        return notFound();
      }

      // 🔹 Permissions
      const isOwner = user?.id === profile.id;
      const isAdmin = user?.user_metadata?.role === 'admin';
      if (!profile.is_public && !isOwner && !isAdmin) {
        router.push(`/${locale}/${username}/private`);
        return;
      }

      // 🔹 Stats initiales
      const [{ count: followersCount }, { count: followingCount }, { count: isFollowingCount }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', profile.id),
        user ? supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id) : Promise.resolve({ count: 0 }),
        user ? supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).eq('followed_id', profile.id) : Promise.resolve({ count: 0 }),
      ]);

      setProfileData(profile);
      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);
      setIsFollowing((isFollowingCount || 0) > 0);
      setLoading(false);

      // 🔹 🔁 Realtime (seulement si profil chargé)
      ({ followChannel, profileChannel } = setupRealtime(profile.id, supabase));
    };

    init();

    return () => {
      if (followChannel) followChannel.unsubscribe();
      if (profileChannel) profileChannel.unsubscribe();
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