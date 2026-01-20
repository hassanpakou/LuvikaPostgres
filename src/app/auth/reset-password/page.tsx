// src/app/auth/reset-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordRedirect() {
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ⏳ Attend que les params soient prêts
    if (searchParams) {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next');

      // Redirige vers /auth/update-password avec les mêmes params
      const url = new URL('/auth/update-password', window.location.origin);
      if (tokenHash) url.searchParams.set('token_hash', tokenHash);
      if (type) url.searchParams.set('type', type);
      if (next) url.searchParams.set('next', next);

      window.location.href = url.toString();
      setIsReady(true);
    }
  }, [searchParams]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-300">Redirection vers la page de réinitialisation...</p>
        </div>
      </div>
    );
  }

  return null;
}