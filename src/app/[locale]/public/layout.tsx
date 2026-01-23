// src/app/[locale]/public/layout.tsx
import Link from "next/link";
import { Toaster } from "sonner";
import Footer from "../../../components/layout/Footer"; // 👈 Import
import { getTranslations } from "next-intl/server"; // 👈 Pour les traductions

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 👇 Récupère les traductions du footer
  const t = await getTranslations("footer");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fond animé spécifique au profil */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
      </div>

      <main className="w-full flex-1">
        {children}
        <Toaster richColors position="top-right" />
      </main>

      {/* 🔹 Footer complet avec traductions */}
      <Footer
        product={t('product')}
        features={t('features')}
        pricing={t('pricing')}
        download={t('download')}
        company={t('company')}
        about={t('about')}
        contact={t('contact')}
        blog={t('blog')}
        legal={t('legal')}
        privacy={t('privacy')}
        terms={t('terms')}
        cookies={t('cookies')}
        tagline={t('tagline')}
        copyright={t('copyright')}
      />
    </div>
  );
}