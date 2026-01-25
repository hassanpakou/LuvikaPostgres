// src/app/[locale])/[username]/page.tsx

import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

import PublicProfileClient from '../../../components/profile/PublicProfileClient';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  // --- Locales autorisés ---
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
if (!supported.includes(locale as any)) {
  redirect('/fr'); // ou toute autre locale par défaut
}
  const decodedUsername = decodeURIComponent(username).toLowerCase().trim();

  // --- Routes réservées ---
  const RESERVED_ROUTES = [
    'pricing',
    'about',
    'contact',
    'download',
    'dashboard',
    'auth',
    'complete-profile',
    'api',
    'private',
    'terms',
    'cookies',
    'blog',
    'privacy'
  ];

  if (RESERVED_ROUTES.includes(decodedUsername)) {
    notFound();
  }

  // --- Supabase Server Client ---
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // --- Récupération profil ---
  let profileData = null;
  let profileError = null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*, plan, accepts_contact_requests, cover_url, theme')
    .ilike('username', decodedUsername)
    .maybeSingle();

  if (!data && !error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('*, accepts_contact_requests')
      .ilike('username', `%${decodedUsername}%`)
      .limit(1)
      .maybeSingle();

    profileData = fallbackData;
    profileError = fallbackError;
  } else {
    profileData = data;
    profileError = error;
  }

  if (profileError || !profileData) {
    console.error('❌ Profil introuvable:', { username: decodedUsername });
    notFound();
  }

  // --- Auth ---
  const { data: { user } } = await supabase.auth.getUser();
  const currentUser = user as User | null;

  const isOwner = currentUser?.id === profileData.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  if (!profileData.is_public && !isOwner && !isAdmin) {
    return redirect(`/${locale}/${decodedUsername}/private`);
  }

  // --- Followers ---
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', profileData.id);

  const initialFollowers = followersCount || 0;

  // --- Following ---
  let initialFollowing = 0;
  let isInitiallyFollowing = false;

  if (currentUser) {
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUser.id);

    initialFollowing = followingCount || 0;

    const { count: followingThisUser } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUser.id)
      .eq('followed_id', profileData.id);

    isInitiallyFollowing = (followingThisUser || 0) > 0;
  }

  // --- Render ---
  return (
    <div suppressHydrationWarning className="min-h-screen relative">

      {/* Fond animé profil */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
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
