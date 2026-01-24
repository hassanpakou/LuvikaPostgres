// src/app/blog/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function BlogPage() {
  const t = useTranslations('footer');
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{t('blog')}</h1>
      <p className="text-gray-400 mb-8">Bientôt disponible ! Restez à l’écoute pour des actualités, tutoriels et mises à jour.</p>
      <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
      <div className="mt-8">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 justify-center">
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}