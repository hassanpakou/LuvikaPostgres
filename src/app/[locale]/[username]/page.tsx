import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import PublicProfileClientWrapper from '../../../components/profile/PublicProfileClientWrapper';
import { Suspense } from 'react';

// 🔹 Suppression de unstable_cache (cause de l'erreur)
// const getCachedProfile = unstable_cache(...);

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  // --- 1️⃣ Vérification des locales ---
  const supported = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
  if (!supported.includes(locale as any)) {
    redirect('/fr');
  }

  const decodedInput = decodeURIComponent(username).toLowerCase().trim();

  // --- 2️⃣ Vérification des routes réservées ---
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
  ];
  if (RESERVED_ROUTES.includes(decodedInput)) {
    notFound();
  }

  // --- 3️⃣ Supabase Server Client ---
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // --- 🔹 4️⃣ DÉTECTION : username vs public_id ---
  let profileData = null;
  let profileError = null;
  let searchBy: 'username' | 'public_id' = 'username';

  // 🔹 Détection : si commence par 'lkv_' → c'est un public_id NFC
  if (decodedInput.startsWith('lkv_')) {
    searchBy = 'public_id';
    
    console.log('🔍 Recherche par public_id:', decodedInput);
    
    // 🔹 Recherche par public_id (exact match) - SANS CACHE
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        plan,
        accepts_contact_requests,
        cover_url,
        theme
      `)
      .eq('public_id', decodedInput)
      .maybeSingle();

    console.log('📊 Résultat profil:', data ? 'TROUVÉ' : 'NON TROUVÉ', '| Erreur:', error);
    
    profileData = data;
    profileError = error;
  } else {
    searchBy = 'username';
    
    console.log('🔍 Recherche par username:', decodedInput);
    
    // 🔹 Recherche par username (exact match) - SANS CACHE
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        plan,
        accepts_contact_requests,
        cover_url,
        theme
      `)
      .ilike('username', decodedInput)
      .maybeSingle();

    if (error || !data) {
      // 🔹 Fallback : correspondance partielle
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select(`
          *,
          plan,
          accepts_contact_requests,
          cover_url,
          theme
        `)
        .ilike('username', `%${decodedInput}%`)
        .limit(1)
        .maybeSingle();

      profileData = fallbackData;
      profileError = fallbackError;
    } else {
      profileData = data;
    }
  }

  // 🔹 CORRECTION CRITIQUE : Vérification stricte avant rendu
  if (profileError || !profileData || Object.keys(profileData).length === 0) {
    console.error('❌ ERREUR FATALE: Profil introuvable', { 
      input: decodedInput, 
      searchBy,
      profileError,
      profileData 
    });
    
    notFound();
  }

// --- 🔹 5️⃣ Récupération de card_configs ---
const { data: cardConfigsData, error: cardConfigsError } = await supabase
  .from('card_configs')
  .select('*')
  .eq('profile_id', profileData.id);

if (cardConfigsError) {
  console.error('❌ Erreur chargement card_configs:', cardConfigsError);
}

  // --- 🔹 6️⃣ Récupération des statistiques de scans ---
  let scansCount = 0;
  try {
    const { count } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileData.id);
    scansCount = count || 0;
  } catch (err) {
    console.warn('⚠️ Erreur chargement scans:', err);
  }

  // --- 🔹 7️⃣ Authentification ---
  const { data: { user } } = await supabase.auth.getUser();
  const currentUser = user as User | null;
  const isOwner = currentUser?.id === profileData.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  // --- 🔹 8️⃣ Gestion des profils privés ---
  if (!profileData.is_public && !isOwner && !isAdmin) {
    return redirect(`/${locale}/${decodedInput}/private`);
  }

  // --- 🔹 9️⃣ Followers ---
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', profileData.id);
  const initialFollowers = followersCount || 0;

  // --- 🔹 🔟 Following ---
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

  const cardConfigs = cardConfigsData || [];
    
  // --- 🔹 1️⃣2️⃣ Analytics : Enregistrer le scan NFC ---
  if (searchBy === 'public_id') {
    try {
      await supabase
        .from('scans')
        .insert({
          profile_id: profileData.id,
          scan_type: 'nfc',
          created_at: new Date().toISOString(),
        });
      
      await supabase
        .from('profiles')
        .update({ 
          scans_count: (profileData.scans_count || 0) + 1 
        })
        .eq('id', profileData.id);
        
      console.log('✅ Scan NFC enregistré pour:', profileData.username || profileData.public_id);
    } catch (err) {
      console.warn('⚠️ Erreur enregistrement scan NFC:', err);
    }
  }

  // --- 🔹 1️⃣3️⃣ Render avec Suspense ---
  return (
    
      <PublicProfileClientWrapper
      profile={{
        ...profileData,
        _cardConfigs: cardConfigsData || [] // ✅ ATTACHEMENT OBLIGATOIRE
      }}
      currentUser={currentUser}
      initialFollowers={initialFollowers}
      initialFollowing={initialFollowing}
      isInitiallyFollowing={isInitiallyFollowing}
      searchBy={searchBy}
      locale={locale}
      input={decodedInput}
    />

  );
}