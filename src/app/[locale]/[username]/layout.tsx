// src/app/[locale]/[username]/layout.tsx
// Layout spécifique pour les profils publics - pas de header ni footer

export const metadata = {
  title: 'Profil · LUVIKA',
  description: 'Carte de visite digitale NFC & QR',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  // Retourne juste les enfants sans header ni footer
  // Le layout racine (src/app/layout.tsx) gère déjà <html> et <body>
  return <>{children}</>;
}