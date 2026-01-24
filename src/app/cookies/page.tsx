// src/app/cookies/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CookiesPage() {
  const t = useTranslations('footer');
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">{t('cookies')}</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
        <p>LUVIKA utilise des cookies strictement nécessaires au fonctionnement du site :</p>
        <ul>
          <li><strong>Authentification</strong> : cookies Supabase pour garder votre session active</li>
          <li><strong>Préférences</strong> : langue sélectionnée, thème (si activé)</li>
          <li><strong>Sécurité</strong> : protection contre les attaques CSRF</li>
        </ul>
        <p>⚠️ Aucun cookie de suivi (Google Analytics, Meta Pixel, etc.) n’est utilisé.</p>
        <p>Vous pouvez gérer ou supprimer les cookies via les paramètres de votre navigateur.</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}