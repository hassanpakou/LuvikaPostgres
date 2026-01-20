// src/app/(main)/[locale]/[username]/layout.tsx
import { Toaster } from 'sonner';
import { NetworkWatcher } from '@/src/components/system/NetworkWatcher';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Fond animé spécifique au profil */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
      </div>

      <main className="w-full">
        {children}
        <Toaster richColors position="top-right" />
        <NetworkWatcher />
      </main>
    </div>
  );
}