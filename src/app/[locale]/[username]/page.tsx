// src/app/[locale]/[username]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import PublicProfileClient from '../../../../src/components/profile/PublicProfileClient';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const decodedUsername = decodeURIComponent(username).toLowerCase();

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

  let profileData = null;
  let profileError = null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*, plan, accepts_contact_requests, cover_url')
    .ilike('username', decodedUsername.trim())
    .maybeSingle();

  if (error) {
    profileError = error;
  } else if (data) {
    profileData = data;
  } else {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('*, accepts_contact_requests')
      .ilike('username', `%${decodedUsername.trim()}%`)
      .limit(1)
      .maybeSingle();

    profileData = fallbackData;
    profileError = fallbackError;
  }

  if (profileError || !profileData) {
    console.error('❌ Profil introuvable:', { username: decodedUsername });
    notFound();
  }

  // 🔹 Auth & permissions
  const { data: { user } } = await supabase.auth.getUser();
  const currentUser = user as User | null;
  const isOwner = currentUser?.id === profileData.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  if (!profileData.is_public && !isOwner && !isAdmin) {
    return redirect(`/${locale}/${username}/private`);
  }

  // 🔹 ✅ Followers public (SSR)
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', profileData.id);
  const initialFollowers = followersCount || 0;

  // 🔹 ✅ Following privé → seulement si auth
  let initialFollowing = 0;
  let isInitiallyFollowing = false;
  if (currentUser) {
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUser.id);
    initialFollowing = followingCount || 0;

    // 🔹 ✅ Statut « suit déjà »
    const { count: followingThisUser } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUser.id)
      .eq('followed_id', profileData.id);
    isInitiallyFollowing = (followingThisUser || 0) > 0;
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
          followers={initialFollowers}
          following={initialFollowing}
          isOwner={isOwner}
          isInitiallyFollowing={isInitiallyFollowing}
          currentUserId={currentUser?.id || null}
        />
      </div>
    </div>
  );
}