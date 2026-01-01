// src/app/[locale]/[username]/private/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function PrivateProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 🔹 Récupère le profil (même privé) pour afficher nom/avatar
  const { data : profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .ilike('username', decodeURIComponent(username).trim())
    .maybeSingle();

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900/20 flex flex-col items-center justify-center p-4 text-center">
      <div className="glass-border bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {profile.full_name || profile.username}
        </h1>

        <h2 className="text-xl font-semibold text-amber-300 mb-3">Profil privé</h2>

        <p className="text-gray-300 mb-5">
          Ce profil est actuellement <span className="font-medium">masqué au public</span>.<br />
          Son propriétaire a choisi de le garder privé.
        </p>

        <a
          href="/"
          className="inline-block px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          ↩ Retour à l’accueil
        </a>

        <p className="text-xs text-gray-500 mt-6">
          ℹ️ Ce contenu est volontairement limité<br />
          🔐 Conformément aux souhaits de l’utilisateur
        </p>
      </div>
    </div>
  );
}