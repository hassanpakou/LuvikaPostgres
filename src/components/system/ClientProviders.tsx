// src/components/system/ClientProviders.tsx
'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { NetworkWatcher } from "@/src/components/system/NetworkWatcher";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
      {isClient && <NetworkWatcher />}
    </>
  );
}