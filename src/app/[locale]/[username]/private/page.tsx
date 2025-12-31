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

  // 🔹 Récupère le profil (même privé) pour afficher le nom/avatar
  const { data : profile } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .ilike('username', decodeURIComponent(username).trim())
    .maybeSingle();

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/10 flex flex-col items-center justify-center p-4 text-center">
      {/* 🔹 Arrière-plan subtil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: `${12 + Math.random() * 20}px`,
              height: `${12 + Math.random() * 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* 🔹 Avatar */}
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-white/30 shadow-xl mb-6">
          {profile.full_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase() || '?'}
        </div>

        {/* 🔹 Texte */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {profile.full_name || profile.username}
        </h1>

        <div className="glass-border bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Profil privé</h2>
          <p className="text-gray-300 mb-4">
            Ce profil est actuellement <span className="font-medium text-amber-300">privé</span>.<br />
            Le propriétaire a choisi de ne pas le rendre public pour le moment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-200 hover:bg-gray-600/50 transition-colors"
            >
              Retour à l’accueil
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          ℹ️ Ce contenu est volontairement limité.<br />
          🔐 Conformément aux souhaits de l’utilisateur.
        </p>
      </div>
    </div>
  );
}