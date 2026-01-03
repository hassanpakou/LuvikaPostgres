// src/app/[locale]/[username]/layout.tsx
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

export const metadata = {
  // Optionnel : override ici si besoin
};

export default async function PublicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔹 ✅ Aucun Navbar, aucun Footer → pure landing page
  // 🔹 ✅ Fond animé minimal (optionnel)

  const t = await getTranslations('footer'); // si tu veux le "Powered by" discret

  return (
    <>
      {children}
      
      {/* 🔹 ✅ Optionnel : branding discret */}
      <div className="fixed bottom-4 right-4 z-10">
        <a 
          href="/" 
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <span className="font-medium text-cyan-400">LUVIKA</span>
        </a>
      </div>
    </>
  );
}