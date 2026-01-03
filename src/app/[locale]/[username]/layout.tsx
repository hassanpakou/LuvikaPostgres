// src/app/[locale]/[username]/layout.tsx
import type { ReactNode } from 'react';

export default function PublicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ✅ Aucun <Navbar> ou <Footer> ici → pure page profil
  return <>{children}</>;
}