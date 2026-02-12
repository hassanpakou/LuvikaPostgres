// src/components/providers/SessionTimeoutProvider.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '../../lib/supabase/client';
import { LogOut, AlertTriangle } from 'lucide-react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // Avertissement 1 minute avant

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // ✅ CORRECTION TYPESCRIPT : Initialisation explicite avec null + type number (navigateur)
  const timeoutRef = useRef<number | null>(null);
  const warningRef = useRef<number | null>(null);
  const lastActivityRef = useRef(Date.now());

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/sign-in?reason=timeout');
      toast('🔒 Session expirée', {
        description: 'Déconnecté pour inactivité. Veuillez vous reconnecter.',
        icon: <LogOut className="w-5 h-5 text-amber-400" />,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erreur déconnexion timeout:', error);
      router.push('/auth/sign-in?reason=error');
    }
  };

  const resetTimers = () => {
    // ✅ Nettoyage sécurisé avec vérification null
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current !== null) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }

    lastActivityRef.current = Date.now();

    // Timer d'avertissement (14 min)
    warningRef.current = window.setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT - WARNING_TIME) {
        toast.warning('⚠️ Session inactive', {
          description: 'Déconnexion automatique dans 60 secondes pour sécurité',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          duration: 10000,
        });
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME) as unknown as number;

    // Timer de déconnexion (15 min)
    timeoutRef.current = window.setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT) {
        handleSignOut();
      }
    }, INACTIVITY_TIMEOUT) as unknown as number;
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    resetTimers();
    
    events.forEach(event => window.addEventListener(event as any, resetTimers));
    
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      if (warningRef.current !== null) clearTimeout(warningRef.current);
      events.forEach(event => window.removeEventListener(event as any, resetTimers));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <>{children}</>;
}