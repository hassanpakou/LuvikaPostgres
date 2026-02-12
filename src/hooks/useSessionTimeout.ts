// src/hooks/useSessionTimeout.ts
import { useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function useSessionTimeout() {
  useEffect(() => {
    const supabase = createClient();
    let timeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      
      // Avertissement à 14 minutes
      warningTimeout = setTimeout(() => {
        if (confirm('⚠️ Session inactive. Voulez-vous rester connecté ?')) {
          resetTimer();
        } else {
          supabase.auth.signOut();
        }
      }, INACTIVITY_TIMEOUT - 60000);
      
      // Déconnexion à 15 minutes
      timeout = setTimeout(() => {
        supabase.auth.signOut();
        window.location.href = '/auth/sign-in?reason=timeout';
      }, INACTIVITY_TIMEOUT);
    };

    // Événements qui réinitialisent le timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Démarrer le timer
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);
}