'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '../../lib/supabase/client';
import { LogOut, AlertTriangle } from 'lucide-react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 1 minute avant

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const isSigningOutRef = useRef(false);

  const handleSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
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
    } finally {
      isSigningOutRef.current = false;
    }
  }, [router]);

  const resetTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    lastActivityRef.current = Date.now();

    warningRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT - WARNING_TIME) {
        toast.warning('⚠️ Session inactive', {
          description: 'Déconnexion automatique dans 60 secondes pour sécurité',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          duration: 10000,
        });
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT) {
        handleSignOut();
      }
    }, INACTIVITY_TIMEOUT);
  }, [handleSignOut]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    resetTimers();
    events.forEach(event => window.addEventListener(event, resetTimers));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, [resetTimers]);

  return <>{children}</>;
}