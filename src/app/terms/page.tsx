// src/app/terms/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function TermsPage() {
  const t = useTranslations('footer');
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">{t('terms')}</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
        <p><strong>En vigueur au :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
        <h2>1. Acceptation des conditions</h2>
        <p>En utilisant LUVIKA, vous acceptez ces conditions. Si vous n’êtes pas d’accord, veuillez ne pas utiliser le service.</p>
        <h2>2. Compte utilisateur</h2>
        <p>Vous êtes responsable de la sécurité de votre compte et des informations que vous partagez publiquement.</p>
        <h2>3. Propriété intellectuelle</h2>
        <p>LUVIKA et son code source sont la propriété de ses auteurs. Le contenu que vous publiez reste le vôtre.</p>
        <h2>4. Limitation de responsabilité</h2>
        <p>LUVIKA est fourni « tel quel ». Nous ne garantissons pas la disponibilité 24/7 ni la fiabilité des scans NFC/QR.</p>
        <h2>5. Modifications</h2>
        <p>Nous pouvons mettre à jour ces conditions. Vous serez informé(e) en cas de changement majeur.</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}