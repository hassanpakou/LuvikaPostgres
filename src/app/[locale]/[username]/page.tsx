// src/app/[locale]/[username]/page.tsx
import { notFound } from 'next/navigation';
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

  // ✅ Correction : `let`, pas `const`
  let profileData = null;
  let profileError = null;

  // 🔹 Première tentative
  const {   data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', decodedUsername.trim())
    .maybeSingle();

  if (error) {
    profileError = error;
  } else if (data) {
    profileData = data;
  } else {
    // 🔁 Deuxième tentative (fallback)
    const {   data: fallbackData, error: fallbackError } = await supabase
  .from('profiles')
  .select('*')
  .ilike('username', `%${decodedUsername.trim()}%`)
  .limit(1)
  .maybeSingle();

profileData = fallbackData;
profileError = fallbackError;}

  if (profileError || !profileData) {
    console.error('❌ Profil introuvable:', { username: decodedUsername });
    notFound();
  }

  // ✅ Auth sécurisée
  const { data : userData, error: authError } = await supabase.auth.getUser();
  const currentUser = userData?.user as User | null;
  const isOwner = currentUser?.id === profileData.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  if (!profileData.is_public && !isOwner && !isAdmin) {
    notFound();
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen relative">
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
        <PublicProfileClient profile={profileData} />
      </div>
    </div>
  );
}