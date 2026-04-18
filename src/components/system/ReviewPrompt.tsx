'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageCircle, Heart, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export function ReviewPrompt() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // Refs pour le temps passé et les pages vues
  const startTimeRef = useRef(Date.now());
  const pageViewsRef = useRef(0);
  const hasCheckedRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  // 🔹 Configuration
  const MIN_TIME_SPENT = parseInt(process.env.NEXT_PUBLIC_REVIEW_MIN_TIME || '120000');
  const MIN_PAGE_VIEWS = parseInt(process.env.NEXT_PUBLIC_REVIEW_MIN_VIEWS || '3');
  const PROMPT_DELAY = 5000;
  const REMINDER_DELAY = 7 * 24 * 60 * 60 * 1000;

  // 🔹 Vérifier l'authentification
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingAuth(false);
    });
  }, []);

  // 🔹 Compter les pages vues via le changement de pathname
  useEffect(() => {
    // Incrémenter pour la première page
    pageViewsRef.current = 1;
    previousPathnameRef.current = pathname;

    // Détecter les changements de route
    const handleRouteChange = () => {
      if (previousPathnameRef.current !== pathname) {
        pageViewsRef.current++;
        previousPathnameRef.current = pathname;
      }
    };
    handleRouteChange(); // pour le premier chargement
    // Pas d'événement router.events, on utilise un effet qui s'exécute à chaque changement de pathname
    // On va simplement observer pathname
  }, [pathname]); // chaque fois que pathname change, on incrémente

  // 🔹 Vérifier si l'utilisateur a déjà donné un avis
  useEffect(() => {
    if (!user) return;
    const checkExistingReview = async () => {
      try {
        const res = await fetch(`/api/review/check?userId=${user.id}`);
        const data = await res.json();
        setHasAlreadyReviewed(data.hasSubmitted);
        if (data.hasSubmitted) {
          localStorage.setItem('review_prompt_accepted', 'true');
        }
      } catch (err) {
        console.error('Erreur vérification avis existant', err);
      }
    };
    checkExistingReview();
  }, [user]);

  // 🔹 Vérifier les conditions d'affichage du prompt
  useEffect(() => {
    if (loadingAuth || hasCheckedRef.current) return;
    if (!user) return;
    if (hasAlreadyReviewed) return;
    if (pathname?.startsWith('/auth')) return;

    const declined = localStorage.getItem('review_prompt_declined');
    const accepted = localStorage.getItem('review_prompt_accepted');
    const lastShown = localStorage.getItem('review_prompt_last_shown');

    if (declined || accepted) {
      hasCheckedRef.current = true;
      return;
    }
    if (lastShown && Date.now() - parseInt(lastShown) < REMINDER_DELAY) {
      hasCheckedRef.current = true;
      return;
    }

    const checkInterval = setInterval(() => {
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent >= MIN_TIME_SPENT && pageViewsRef.current >= MIN_PAGE_VIEWS && !hasInteracted) {
        setHasInteracted(true);
        setTimeout(() => setShowPrompt(true), PROMPT_DELAY);
        clearInterval(checkInterval);
        hasCheckedRef.current = true;
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [loadingAuth, user, pathname, hasInteracted, hasAlreadyReviewed]);

  // 🔹 Gérer la réponse au prompt
  const handlePromptResponse = (action: 'accept' | 'decline' | 'later') => {
    const now = Date.now();
    switch (action) {
      case 'accept':
        localStorage.setItem('review_prompt_accepted', 'true');
        localStorage.setItem('review_prompt_last_shown', now.toString());
        setShowPrompt(false);
        setShowReviewModal(true);
        break;
      case 'decline':
        localStorage.setItem('review_prompt_declined', 'true');
        localStorage.setItem('review_prompt_last_shown', now.toString());
        setShowPrompt(false);
        break;
      case 'later':
        localStorage.setItem('review_prompt_last_shown', now.toString());
        setShowPrompt(false);
        break;
    }
  };

  // 🔹 Soumettre l'avis
  const submitReview = async () => {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }
    if (comment && comment.length > 500) {
      toast.error('Le commentaire ne peut pas dépasser 500 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Vous avez déjà soumis un avis. Merci !');
          setShowReviewModal(false);
          return;
        }
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      toast.success(data.message || 'Merci pour votre avis !', {
        duration: 5000,
      });
      setShowReviewModal(false);
      setRating(0);
      setComment('');
      localStorage.setItem('review_prompt_accepted', 'true');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Ne rien afficher si l'utilisateur n'est pas connecté, ou a déjà avisé
  if (loadingAuth || !user) return null;
  if (hasAlreadyReviewed) return null;

  return (
    <AnimatePresence>
      {/* Modal de demande d'avis */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => handlePromptResponse('later')}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="glass-border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-900/10 p-6 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl" />

              <button
                onClick={() => handlePromptResponse('later')}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

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
                  <Heart className="w-6 h-6 text-rose-400" />
                  Vous aimez LUVIKA ?
                </h3>

                <p className="text-gray-300 mb-6">
                  Votre avis compte énormément ! Prenez 30 secondes pour partager votre expérience.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => handlePromptResponse('accept')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Laisser un avis
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handlePromptResponse('later')}
                    className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  >
                    Plus tard
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handlePromptResponse('decline')}
                    className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  >
                    Non merci
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  🔒 Votre avis est anonyme et contribue à l'amélioration de LUVIKA.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de soumission d'avis (intégré) */}
      {showReviewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowReviewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="glass-border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 relative overflow-hidden">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white">Votre avis</h3>
                <p className="text-sm text-gray-400">Votre feedback nous aide à grandir</p>
              </div>

              {/* Sélection des étoiles */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Commentaire */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience (optionnel, max 500 caractères)"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mb-4"
                rows={4}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500"
                >
                  {isSubmitting ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Votre avis est anonyme et ne sera pas publié publiquement.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}