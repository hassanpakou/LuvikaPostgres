// src/app/(main)/layout.tsx
'use client';

import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'sonner';
import { NetworkWatcher } from '@/src/components/system/NetworkWatcher';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fond animé — statique */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 animate-float" />
          <div className="absolute top-2/3 right-1/3 w-80 h-80 rounded-full bg-cyan-400/5 animate-float" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-indigo-500/5 animate-float" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      <Navbar />
      <main className="container mx-auto px-4 py-0 max-w-6xl">
        {children}
        <Toaster richColors position="top-right" />
        <NetworkWatcher />
      </main>
    </>
  );
}