// src/components/profile/PublicProfileClientWrapper.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useOptimistic } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import PublicProfileClient from '../../components/profile/PublicProfileClient';
import { toast } from 'sonner';
import { QrCode } from 'lucide-react';

export default function PublicProfileClientWrapper({
  profile: initialProfile,
  currentUser,
  initialFollowers,
  initialFollowing,
  isInitiallyFollowing,
  searchBy,
  locale,
  input,
}: {
  profile: any;
  currentUser: User | null;
  initialFollowers: number;
  initialFollowing: number;
  isInitiallyFollowing: boolean;
  searchBy: 'username' | 'public_id';
  locale: string;
  input: string;
}) {
  // 🔹 Optimistic updates pour les followers
  const [optimisticFollowers, addOptimisticFollowers] = useOptimistic(
    initialFollowers,
    (state: number, action: { type: 'increment' | 'decrement' }) => {
      return action.type === 'increment' ? state + 1 : state - 1;
    }
  );
  
  // 🔹 EXTRACTION DES DONNÉES ATTACHÉES
  const initialCardConfigs = initialProfile._cardConfigs || [];
  const initialScansCount = initialProfile._scansCount || 0;
  
  const [profileData, setProfileData] = useState<any>(initialProfile);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date()); // 🔹 Gardé pour l'indicateur UI
  const [cardConfigs, setCardConfigs] = useState(initialCardConfigs); // ✅
  const [scansCount, setScansCount] = useState(initialScansCount); // ✅
 
  const router = useRouter();
  const pathname = usePathname();
  const realtimeChannels = useRef<any[]>([]);
  const supabase = useRef<any>(null);

  // 🔹 Initialisation Supabase client
  useEffect(() => {
    supabase.current = createClient();
  }, []);

  // 🔹 Fonction pour charger les stats initiales
  const fetchStats = useCallback(async (profileId: string, userId: string | null) => {
    if (!supabase.current) return;

    try {
      const [{ count: followersCount }, { count: followingCount }, { count: isFollowingCount }] = await Promise.all([
        supabase.current.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', profileId),
        userId ? supabase.current.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId) : Promise.resolve({ count: 0 }),
        userId ? supabase.current.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('followed_id', profileId) : Promise.resolve({ count: 0 }),
      ]);

      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);
      setIsFollowing((isFollowingCount || 0) > 0);
    } catch (err) {
      console.warn('Erreur chargement stats:', err);
    }
  }, []);

  // 🔹 Notification système
  const showFollowNotification = useCallback((follower: any) => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${follower.full_name || follower.username} vous suit !`, {
        body: 'Cliquez pour voir son profil',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.open(`/${locale}/${follower.username}`, '_blank');
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  }, [locale]);

  // 🔹 Demander permission notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 🔹 Configuration Realtime complète
  const setupRealtime = useCallback((profileId: string, userId: string | null) => {
    if (!supabase.current) return;

    // 🔸 Canal : mises à jour du profil
    const profileChannel = supabase.current
      .channel(`profile-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${profileId}`,
      }, (payload: { new: any }) => {
        setProfileData((prev: any) => ({ ...prev, ...payload.new }));
        setLastUpdate(new Date());
        console.log('🔄 Profil mis à jour en temps réel');
      })
      .subscribe();

    // 🔸 Canal : mises à jour des card_configs (CORRECTION ULTIME)
const cardConfigsChannel = supabase.current
  .channel(`card-configs-${profileId}-${Date.now()}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'card_configs',
    filter: `profile_id=eq.${profileId}`,
  }, async () => {
    try {
      // 🔹 RÉCUPÉRATION COMPLÈTE DU TABLEAU (pas d'objet !)
      const { data, error } = await supabase.current
        .from('card_configs')
        .select('*') // ✅ '*' pour avoir tous les champs nécessaires
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      // ✅ MISE À JOUR DE L'ÉTAT AVEC LE TABLEAU COMPLET
      setCardConfigs(data || []);
      setLastUpdate(new Date());
      
      console.log('🔄 Card configs mis à jour en temps réel | Count:', data?.length || 0);
      
      // 🔹 Feedback utilisateur subtil (optionnel)
      if (typeof window !== 'undefined' && document.hasFocus()) {
        // toast.success('✅ Configuration carte mise à jour', { duration: 1500 });
      }
    } catch (err) {
      console.error('❌ Erreur mise à jour card_configs:', err);
    }
  })
  .subscribe();

    // 🔸 Canal : changements de follows
    const followChannel = supabase.current
      .channel(`follows-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `followed_id=eq.${profileId}`,
      }, () => {
        fetchStats(profileId, userId);
        setLastUpdate(new Date());
      })
      .subscribe();

    // 🔸 Canal : notifications de follow
    const notificationChannel = supabase.current
      .channel(`follow-notifications-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `followed_id=eq.${profileId}`,
      }, async (payload: any) => {
        const followerId = payload.new.follower_id;
        if (followerId === userId) return;

        const { data: follower } = await supabase.current
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', followerId)
          .single();

        if (follower) {
          addOptimisticFollowers({ type: 'increment' });
          showFollowNotification(follower);
        }
      })
      .subscribe();

    // 🔸 Canal : mises à jour des scans (pour lastUpdate uniquement)
    const scansChannel = supabase.current
      .channel(`scans-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scans',
        filter: `profile_id=eq.${profileId}`,
      }, () => {
        setLastUpdate(new Date());
        console.log('📱 Nouveau scan détecté');
      })
      .subscribe();

    // 🔸 Canal : mises à jour des likes
    const likesChannel = supabase.current
      .channel(`likes-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `profile_id=eq.${profileId}`,
      }, async () => {
        const { count } = await supabase.current
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);
        
        setProfileData((prev: any) => ({
          ...prev,
          likes_count: count || 0
        }));
        setLastUpdate(new Date());
      })
      .subscribe();

    // 🔸 Canal : mises à jour des cartes NFC
    const nfcChannel = supabase.current
      .channel(`nfc-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nfc_cards',
        filter: `profile_id=eq.${profileId}`,
      }, async () => {
        const { data } = await supabase.current
          .from('nfc_cards')
          .select('status, scan_count, last_scan_at')
          .eq('profile_id', profileId);
        
        setProfileData((prev: any) => ({
          ...prev,
          nfc_cards: data || []
        }));
        setLastUpdate(new Date());
      })
      .subscribe();

    // 🔸 Canal : mises à jour des portfolios
    const portfolioChannel = supabase.current
      .channel(`portfolio-${profileId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'portfolios',
        filter: `profile_id=eq.${profileId}`,
      }, async () => {
        try {
          const res = await fetch(`/api/portfolio?profile_id=${profileId}`, {
            cache: 'no-store',
          });
          const { portfolios, certificates } = await res.json();
          
          setProfileData((prev: any) => ({
            ...prev,
            portfolios: portfolios || [],
            certificates: certificates || []
          }));
          setLastUpdate(new Date());
        } catch (err) {
          console.warn('Erreur mise à jour portfolio:', err);
        }
      })
      .subscribe();

    realtimeChannels.current = [
      profileChannel, 
      followChannel, 
      notificationChannel,
      scansChannel,
      likesChannel,
      nfcChannel,
      portfolioChannel,
      cardConfigsChannel,
    ];

    console.log('✅ Realtime channels subscribed');
  }, [fetchStats, showFollowNotification, addOptimisticFollowers]);

  // 🔹 Initialisation Realtime
  useEffect(() => {
    const userId = currentUser?.id || null;
    
    // 🔹 Vérification profils privés
    const isOwner = currentUser?.id === profileData.id;
    const isAdmin = currentUser?.user_metadata?.role === 'admin';
    
    if (!profileData.is_public && !isOwner && !isAdmin) {
      router.push(`/${locale}/${input}/private`);
      return;
    }

    // 🔹 Setup Realtime
    setupRealtime(profileData.id, userId);

    // 🔹 Heartbeat pour maintenir la connexion
    const heartbeat = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    // 🔹 Cleanup
    return () => {
      clearInterval(heartbeat);
      realtimeChannels.current.forEach(channel => {
        if (channel?.unsubscribe) channel.unsubscribe();
      });
      realtimeChannels.current = [];
      console.log('🧹 Realtime channels unsubscribed');
    };
  }, [profileData.id, currentUser, locale, input, router, setupRealtime]);

  // ✅ Affichage avec indicateur de synchronisation
  return (
    <div suppressHydrationWarning className="min-h-screen relative">
      {/* ... indicateur de synchronisation ... */}
      
      <div className="fixed right-4 mt-6 z-50">


        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          lastUpdate.getTime() > Date.now() - 60000 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            lastUpdate.getTime() > Date.now() - 60000 ? 'bg-green-400' : 'bg-yellow-400'
          } animate-pulse`}></div>
          <span>
            {lastUpdate.getTime() > Date.now() - 60000 
              ? 'Synchronisé' 
              : 'Mise à jour...'}
          </span>
        </div>
      </div>

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

      <div className="container mx-auto pb-20 relative z-10">

        {/* ✅ APRÈS - Utilise l'état React (mis à jour en temps réel) */}
<PublicProfileClient
  profile={profileData}
  cardConfigs={cardConfigs} // ← CORRECT : mis à jour par Realtime
  followers={optimisticFollowers}
  following={following}
  isOwner={currentUser?.id === profileData.id}
  isInitiallyFollowing={isFollowing}
  currentUserId={currentUser?.id || null}
  onFollowChange={(newCount: number, isNowFollowing: boolean) => {
    setFollowers(newCount);
    setIsFollowing(isNowFollowing);
  }}
  lastUpdate={lastUpdate}
/>
      </div>
    </div>
  );
}