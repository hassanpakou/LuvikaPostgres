// src/app/auth/reset-password/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// 🔹 Server-side translations
const t = (key: string) => {
  const translations = {
    'auth.reset_password.back_to_login': 'Retour à la connexion',
    'auth.reset_password.title': 'Réinitialisation en cours...',
    'auth.reset_password.subtitle': 'Redirection vers la page de changement de mot de passe.',
    'auth.reset_password.redirecting': 'Redirection en cours...'
  };
  return translations[key as keyof typeof translations] || key;
};

export default function ResetPasswordRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenHash = searchParams.token_hash;
  const type = searchParams.type;
  const next = searchParams.next;

  // Redirige immédiatement vers /auth/update-password avec les mêmes params
  const url = new URL('/auth/update-password', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  if (tokenHash) url.searchParams.set('token_hash', tokenHash as string);
  if (type) url.searchParams.set('type', type as string);
  if (next) url.searchParams.set('next', next as string);

  redirect(url.toString());

  // Si jamais la redirection échoue, afficher un message de chargement
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Link 
        href="/auth/sign-in" 
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{t('auth.reset_password.back_to_login')}</span>
      </Link>

      <div className="w-full max-w-md relative">
        <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
          <div className="relative p-7 md:p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
              {t('auth.reset_password.title')}
            </h1>
            <p className="text-gray-400 text-sm mb-4">
              {t('auth.reset_password.subtitle')}
            </p>
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-center text-gray-400 text-sm mt-4">
              {t('auth.reset_password.redirecting')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
