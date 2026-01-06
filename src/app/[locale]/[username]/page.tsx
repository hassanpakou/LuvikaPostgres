// src/app/[locale]/[username]/page.tsx
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PublicProfileClientWrapper from '@/src/components/profile/PublicProfileClientWrapper';

// 🔹 ✅ Force le rendering côté client — aucun cache
export const dynamic = 'force-dynamic';
export const revalidate = 0; // désactive ISR/SSG
export const fetchCache = 'force-no-store'; // contourne le cache Next.js

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement du profil…</p>
        </div>
      </div>
    }>
      <PublicProfileClientWrapper params={params} />
    </Suspense>
  );
}