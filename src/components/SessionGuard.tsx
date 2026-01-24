// src/components/SessionGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Récupère le chemin actuel
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // ✅ Ne pas vérifier la session sur les pages publiques
    const isPublicRoute = [
      '/auth',
      '/privacy',
      '/terms',
      '/cookies',
      '/blog',
    ].some(route => pathname?.startsWith(route));

    if (isPublicRoute) return;

    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Nettoie les cookies Supabase
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.trim().split('=')[0];
          if (name.startsWith('sb-')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          }
        });

        setRedirecting(true);
        let timer = 3;
        const interval = setInterval(() => {
          timer -= 1;
          setCountdown(timer);
          if (timer <= 0) {
            clearInterval(interval);
            router.replace('/auth/sign-in'); // ✅ replace au lieu de push
          }
        }, 1000);
      }
    };

    checkSession();
  }, [router, pathname]);

  if (redirecting) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
        <div className="text-center p-6 bg-gray-900 rounded-xl border border-white/10 max-w-md mx-4">
          <h2 className="text-xl font-bold text-white mb-2">Session expirée</h2>
          <p className="text-gray-300 mb-4">
            Votre session a expiré. Redirection vers la page de connexion dans {countdown} seconde{countdown > 1 ? 's' : ''}...
          </p>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}