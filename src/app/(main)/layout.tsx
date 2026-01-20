// src/app/(main)/layout.tsx
// ⚠️ PAS de 'use client' ici

import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import { Toaster } from 'sonner';
import { NetworkWatcher } from '@/src/components/system/NetworkWatcher';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('footer');

  return (
    <>
      {/* 🔹 Fond animé — géré en CSS, pas de JS */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 animate-float" />
          <div className="absolute top-2/3 right-1/3 w-80 h-80 rounded-full bg-cyan-400/5 animate-float" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-indigo-500/5 animate-float" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* ✅ Navbar et Footer restent des Client Components (c'est OK) */}
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl min-h-screen">
        {children}
        <Toaster richColors position="top-right" />
        <NetworkWatcher />
      </main>
      
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
    </>
  );
}