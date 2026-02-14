'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';

export function ReviewPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sessionData, setSessionData] = useState({
    timeSpent: 0,
    pageViews: 0,
    lastActivity: Date.now(),
  });

  // 🔹 Configurable depuis les variables d'environnement
  const MIN_TIME_SPENT = parseInt(process.env.NEXT_PUBLIC_REVIEW_MIN_TIME || '120000'); // 2 min
  const MIN_PAGE_VIEWS = parseInt(process.env.NEXT_PUBLIC_REVIEW_MIN_VIEWS || '3');
  const PROMPT_DELAY = 5000; // Afficher 5s après conditions remplies
  const REMINDER_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 jours avant de redemander

  useEffect(() => {
    // 🔹 Skip sur les pages d'authentification
    if (window.location.pathname.startsWith('/auth')) return;
    
    // 🔹 Vérifier si on doit ignorer (déjà répondu)
    const declined = localStorage.getItem('review_prompt_declined');
    const accepted = localStorage.getItem('review_prompt_accepted');
    const lastShown = localStorage.getItem('review_prompt_last_shown');
    
    if (declined || accepted) return;
    if (lastShown && Date.now() - parseInt(lastShown) < REMINDER_DELAY) return;

    // 🔹 Tracker l'activité utilisateur
    const trackActivity = () => {
      setSessionData(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + (Date.now() - prev.lastActivity),
        lastActivity: Date.now(),
        pageViews: prev.pageViews + 1,
      }));
    };

    // 🔹 Écouter les interactions utilisateur
    const events = ['mousemove', 'scroll', 'keydown', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, trackActivity, { passive: true }));

    // 🔹 Vérifier les conditions toutes les 10s
    const checkInterval = setInterval(() => {
      if (sessionData.timeSpent >= MIN_TIME_SPENT && sessionData.pageViews >= MIN_PAGE_VIEWS && !hasInteracted) {
        setHasInteracted(true);
        setTimeout(() => setShowPrompt(true), PROMPT_DELAY);
      }
    }, 10000);

    // 🔹 Cleanup
    return () => {
      clearInterval(checkInterval);
      events.forEach(event => window.removeEventListener(event, trackActivity));
    };
  }, [sessionData, hasInteracted, MIN_TIME_SPENT, MIN_PAGE_VIEWS]);

  // 🔹 Gérer les réponses utilisateur
  const handleResponse = async (action: 'accept' | 'decline' | 'later') => {
    const now = Date.now();
    
    switch (action) {
      case 'accept':
        localStorage.setItem('review_prompt_accepted', 'true');
        localStorage.setItem('review_prompt_last_shown', now.toString());
        // 🔹 Optionnel : Créer un événement analytics
        if (window.gtag) {
          window.gtag('event', 'review_prompt_accepted', {
            event_category: 'engagement',
            event_label: 'review_prompt'
          });
        }
        // 🔹 Rediriger vers la page d'avis
        window.open('/review', '_blank');
        break;
      
      case 'decline':
        localStorage.setItem('review_prompt_declined', 'true');
        localStorage.setItem('review_prompt_last_shown', now.toString());
        if (window.gtag) {
          window.gtag('event', 'review_prompt_declined', {
            event_category: 'engagement',
            event_label: 'review_prompt'
          });
        }
        break;
      
      case 'later':
        localStorage.setItem('review_prompt_last_shown', now.toString());
        if (window.gtag) {
          window.gtag('event', 'review_prompt_later', {
            event_category: 'engagement',
            event_label: 'review_prompt'
          });
        }
        break;
    }
    
    setShowPrompt(false);
    
    // 🔹 Feedback positif
    if (action === 'accept') {
      toast.success('🙏 Merci pour votre soutien !', {
        description: 'Votre avis nous aide à améliorer LUVIKA pour tous.',
        duration: 9000,
      });
    }
  };

  // 🔹 Ne pas afficher si conditions non remplies ou déjà traité
  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => handleResponse('later')}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="glass-border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-900/10 p-6 relative overflow-hidden">
            {/* Décoration coins */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl" />
            
            {/* Bouton fermer */}
            <button
              onClick={() => handleResponse('later')}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Contenu */}
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-rose-400 animate-pulse" />
                Vous aimez LUVIKA ?
              </h3>
              
              <p className="text-gray-300 mb-6">
                Votre avis compte énormément ! Prenez 30 secondes pour partager votre expérience et nous aider à améliorer la plateforme.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => handleResponse('accept')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Laisser un avis
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleResponse('later')}
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  Plus tard
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => handleResponse('decline')}
                  className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
                >
                  Non merci
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                🔒 Votre avis est anonyme et contribue à l'amélioration de LUVIKA pour toute la communauté africaine
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}