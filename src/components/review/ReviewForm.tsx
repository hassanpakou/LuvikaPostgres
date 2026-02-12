'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Gift, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// 🔹 Correction TypeScript pour gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [eligibleForBadge, setEligibleForBadge] = useState(false);
  const [reviewsThisWeek, setReviewsThisWeek] = useState(85); // Simulé pour le compteur

  useEffect(() => {
    const fetchUserAndEligibility = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
          
          // 🔹 Vérifier si déjà soumis
          const reviewRes = await fetch(`/api/review/check?userId=${data.user.id}`);
          const reviewData = await reviewRes.json();
          
          if (reviewData.hasSubmitted) {
            setHasSubmitted(true);
            return;
          }
          
          // 🔹 Vérifier éligibilité (simulé côté client pour UX)
          const countRes = await fetch('/api/review/count');
          const countData = await countRes.json();
          setEligibleForBadge(countData.count < 100);
          setReviewsThisWeek(countData.count);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    
    fetchUserAndEligibility();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('❌ Vous devez être connecté pour laisser un avis');
      return;
    }
    
    if (rating === 0) {
      toast.warning('⚠️ Veuillez sélectionner une note');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
      setHasSubmitted(true);
      // 🔹 Feedback avec badge si reçu
      toast.success('🙏 Merci pour votre avis !', {
        description: result.receivedBadge 
          ? '✨ Badge "Pionnier LUVIKA" ajouté à votre profil !' 
          : 'Votre avis aide à améliorer LUVIKA pour toute la communauté.',
        duration: 8000,
      });
      
      // 🔹 Analytics
      if (window.gtag) {
        window.gtag('event', 'review_submitted', {
          event_category: 'engagement',
          event_label: 'review_form',
          value: rating
        });
      }
      
    } catch (error: any) {
      console.error('Erreur soumission avis:', error);
      toast.error('❌ Erreur lors de la soumission', {
        description: error.message || 'Veuillez réessayer plus tard'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="glass-border border-emerald-500/30 bg-emerald-900/20 rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Merci infiniment !</h2>
        <p className="text-gray-300 mb-4">
          Votre avis compte énormément pour nous. Ensemble, nous construisons la meilleure plateforme digitale pour l'Afrique.
        </p>
        <Button 
          onClick={() => window.close()} 
          className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
        >
          Fermer cette fenêtre
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-border border-amber-500/30 bg-amber-900/20 rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-12 h-12 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connexion requise</h2>
        <p className="text-gray-300 mb-4">
          Veuillez vous connecter pour partager votre expérience LUVIKA
        </p>
        <Button 
          onClick={() => window.location.href = '/auth/sign-in'} 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
        >
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-border rounded-2xl p-6 bg-white/5 border-white/10">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
          Partagez votre expérience
        </h2>
        <p className="text-gray-400">
          30 secondes pour nous aider à devenir meilleurs ❤️
        </p>
      </div>

      {/* Sélecteur d'étoiles */}
      <div className="mb-6">
        <label className="block text-gray-300 mb-3 text-lg font-medium flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Votre note
        </label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full"
              aria-label={`Note ${star} étoiles`}
            >
              <Star
                className={`w-10 h-10 transition-all ${
                  star <= (hoverRating || rating) 
                    ? 'text-amber-400 fill-amber-400 scale-110' 
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center mt-2 text-sm text-gray-400">
          {rating === 0 ? 'Sélectionnez une note' : 
           rating < 3 ? 'Nous pouvons faire mieux 😔' :
           rating < 5 ? 'Merci ! 💙' : 'Vous nous motivez ! 🌟'}
        </p>
      </div>

      {/* Champ commentaire */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-gray-300 mb-2 font-medium">
          Commentaire (optionnel)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Qu'avez-vous aimé ? Des suggestions d'amélioration ?"
          className="min-h-[100px] bg-white/5 border-white/10 focus:border-amber-400/50 focus:ring-amber-400/20 text-white placeholder:text-gray-500"
          maxLength={500}
        />
        <p className="text-right text-xs text-gray-500 mt-1">{comment.length}/500</p>
      </div>

      {/* 🔹 BADGE INCITATION + COMPTEUR EN TEMPS RÉEL (PLACEMENT CORRECT) */}
      <div className="space-y-4">
        {/* Message incitation */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-200 flex items-start gap-2">
            <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <span className="font-medium">🎁 Cadeau :</span> Les {eligibleForBadge ? 'prochains' : '100 premiers'} avis cette semaine 
              recevront un badge exclusif <span className="font-bold">"Pionnier LUVIKA"</span> sur leur profil !
            </span>
          </p>
        </div>
        
        {/* 🔹 COMPTEUR EN TEMPS RÉEL (PLACÉ ICI) */}
        <div className="mt-2 text-center">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-400 bg-amber-900/30">
                  {reviewsThisWeek}/100
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold inline-block ${
                  eligibleForBadge ? 'text-amber-400' : 'text-gray-400'
                }`}>
                  {eligibleForBadge ? 'Places restantes' : 'Complet'}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-amber-900/20">
              <div 
                style={{ width: `${Math.min(reviewsThisWeek, 100)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  eligibleForBadge 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gray-500'
                }`}
              ></div>
            </div>
            <p className="text-xs text-gray-400">
              {eligibleForBadge 
                ? 'Soyez parmi les pionniers qui façonnent LUVIKA' 
                : 'Merci aux 100 premiers contributeurs !'}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton soumission */}
      <Button
        type="submit"
        disabled={submitting || rating === 0}
        className={`w-full mt-6 py-6 text-lg font-bold transition-all ${
          submitting
            ? 'bg-gray-500 cursor-wait'
            : rating >= 4
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
            : rating >= 3
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Envoi en cours...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            {rating === 0 ? 'Sélectionnez une note' : 'Envoyer mon avis'}
          </span>
        )}
      </Button>

      {/* Légende discrète */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        🔒 Votre avis est anonyme et contribue à l'amélioration de LUVIKA pour toute la communauté africaine
      </p>
    </form>
  );
}