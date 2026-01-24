// src/app/privacy/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPage() {
  const t = useTranslations('footer');
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Politique de confidentialité – Luvika</h1>
      
      <div className="prose prose-invert max-w-none text-gray-300 space-y-5">
        <h2>1. Introduction</h2>
        <p>Luvika est une plateforme de cartes numériques professionnelles. La protection de vos données personnelles est une priorité. Cette politique explique quelles données nous collectons, pourquoi, et comment elles sont protégées.</p>

        <h2>2. Données collectées</h2>
        <p>Lors de l’utilisation de Luvika, nous pouvons collecter :</p>
        <ul>
          <li>Nom et prénom</li>
          <li>Adresse e-mail</li>
          <li>Numéro de téléphone</li>
          <li>Photo de profil</li>
          <li>Informations de carte numérique créées par l’utilisateur</li>
          <li>Données de connexion (adresse IP, type d’appareil)</li>
        </ul>

        <h2>3. Finalité de la collecte</h2>
        <p>Les données sont utilisées pour :</p>
        <ul>
          <li>Créer et gérer votre compte</li>
          <li>Générer vos cartes numériques</li>
          <li>Sécuriser l’accès à la plateforme</li>
          <li>Améliorer les performances du service</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>Luvika utilise des cookies pour :</p>
        <ul>
          <li>Maintenir votre session connectée</li>
          <li>Sécuriser la navigation</li>
          <li>Mémoriser certaines préférences</li>
        </ul>
        <p><strong>Aucun cookie publicitaire tiers n’est utilisé sans votre consentement.</strong></p>

        <h2>5. Partage des données</h2>
        <p>Vos données ne sont jamais vendues. Elles peuvent être hébergées chez des services techniques sécurisés uniquement pour le fonctionnement de la plateforme.</p>

        <h2>6. Sécurité</h2>
        <p>Nous mettons en place des mesures techniques pour protéger vos informations contre tout accès non autorisé.</p>

        <h2>7. Durée de conservation</h2>
        <p>Les données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression à tout moment.</p>

        <h2>8. Droits de l’utilisateur</h2>
        <p>Vous pouvez :</p>
        <ul>
          <li>Accéder à vos données</li>
          <li>Modifier vos informations</li>
          <li>Supprimer votre compte</li>
        </ul>

        <h2>9. Contact</h2>
        <p>Pour toute demande : <a href="mailto:support@luvika.com" className="text-cyan-300 hover:underline">support@luvika.com</a></p>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}